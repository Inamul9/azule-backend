const fs = require('fs');

let html = fs.readFileSync('public/admin/dashboard.html', 'utf8');

// 1. Replace title and header names
html = html.replace(/<%= settings\.global.*?'Soil Village' .*?%>/g, 'Soil Village');
html = html.replace(/<%= \(settings\.global.*?'SOIL VILLAGE'\)\.toUpperCase\(\) %>/g, 'SOIL VILLAGE');

// 2. Remove EJS if/else for bookings
html = html.replace(/<% if \(bookings\.length === 0\) { %>[\s\S]*?<% } else { %>/, '<tr id="empty-state" style="display:none;"><td colspan="7"><div class="empty-state"><svg>...</svg><h3>No bookings yet</h3></div></td></tr>');

// 3. Remove the entire EJS loop for bookings and replace with empty tbody
const tbodyStart = html.indexOf('<tbody>');
const tbodyEnd = html.indexOf('</tbody>') + 8;
html = html.substring(0, tbodyStart) + '<tbody id="bookings-tbody"></tbody>' + html.substring(tbodyEnd);

// 4. Remove all EJS tags in value attributes
html = html.replace(/value="<%=.*?%>"/g, 'value=""');
html = html.replace(/><%=.*?%></g, '>');

// 5. Remove all remaining EJS blocks like <% const cItems ... %> and <% for ... %>
html = html.replace(/<%.*?%>/g, '');

// 6. Inject the fetch script at the bottom
const script = `
  <script>
    // Fetch data and populate
    async function loadDashboardData() {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        window.location.href = '/admin/index.html';
        return;
      }
      try {
        const res = await fetch('https://manali-backend.onrender.com/admin/api/dashboard-data', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (data.success) {
          populateBookings(data.bookings);
          populateSettings(data.settings);
        } else {
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/index.html';
        }
      } catch (err) {
        console.error(err);
      }
    }
    
    function populateBookings(bookings) {
      document.getElementById('stat-total').textContent = bookings.length;
      document.getElementById('stat-pending').textContent = bookings.filter(b => b.status === 'pending').length;
      document.getElementById('stat-confirmed').textContent = bookings.filter(b => b.status === 'confirmed').length;
      
      const tbody = document.getElementById('bookings-tbody');
      tbody.innerHTML = '';
      if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;">No bookings found.</td></tr>';
        return;
      }
      
      bookings.forEach(b => {
        const tr = document.createElement('tr');
        tr.id = 'row-' + b.id;
        tr.innerHTML = \`
          <td>
            <div class="booking-id-wrap">
              <span class="booking-id">\${b.id}</span>
              <span class="booking-date">\${new Date(b.timestamp).toLocaleDateString()}</span>
            </div>
          </td>
          <td>
            <div class="client-info">
              <span class="client-name">\${b.name}</span>
              <span class="client-phone">\${b.phone}</span>
              <span class="client-email">\${b.email}</span>
            </div>
          </td>
          <td>
            <div class="pkg-info">
              <span class="pkg-badge">\${b.package}</span>
              <div class="pkg-meta">\${b.travelers} traveler(s) · \${b.date}</div>
            </div>
          </td>
          <td>
            <span id="badge-\${b.id}" class="status-badge status-\${b.status}">\${b.status}</span>
          </td>
          <td>
            <div class="action-cell">
              <button class="abtn abtn-ok" onclick="updateStatus('\${b.id}', 'confirmed')">✓</button>
              <button class="abtn abtn-cancel" onclick="updateStatus('\${b.id}', 'cancelled')">✗</button>
              <button class="abtn abtn-del" onclick="deleteBooking('\${b.id}')">🗑</button>
            </div>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function populateSettings(settings) {
      if (!settings) return;
      // Global
      if (settings.global) {
        if(document.getElementsByName('siteName')[0]) document.getElementsByName('siteName')[0].value = settings.global.siteName || '';
        if(document.getElementsByName('phone')[0]) document.getElementsByName('phone')[0].value = settings.global.phone || '';
        if(document.getElementsByName('email')[0]) document.getElementsByName('email')[0].value = settings.global.email || '';
        if(document.getElementsByName('whatsapp')[0]) document.getElementsByName('whatsapp')[0].value = settings.global.whatsapp || '';
        if(document.getElementsByName('instagram')[0]) document.getElementsByName('instagram')[0].value = settings.global.instagram || '';
      }
      // Packages
      if (settings.packages) {
        if(document.getElementsByName('packages_subtitle')[0]) document.getElementsByName('packages_subtitle')[0].value = settings.packages.subtitle || '';
        if(settings.packages.solang) {
          if(document.getElementsByName('pkg_solang_title')[0]) document.getElementsByName('pkg_solang_title')[0].value = settings.packages.solang.title || '';
          if(document.getElementsByName('pkg_solang_desc')[0]) document.getElementsByName('pkg_solang_desc')[0].value = settings.packages.solang.desc || '';
        }
        if(settings.packages.spiti) {
          if(document.getElementsByName('pkg_spiti_title')[0]) document.getElementsByName('pkg_spiti_title')[0].value = settings.packages.spiti.title || '';
          if(document.getElementsByName('pkg_spiti_desc')[0]) document.getElementsByName('pkg_spiti_desc')[0].value = settings.packages.spiti.desc || '';
        }
        if(settings.packages.honeymoon) {
          if(document.getElementsByName('pkg_honeymoon_title')[0]) document.getElementsByName('pkg_honeymoon_title')[0].value = settings.packages.honeymoon.title || '';
          if(document.getElementsByName('pkg_honeymoon_desc')[0]) document.getElementsByName('pkg_honeymoon_desc')[0].value = settings.packages.honeymoon.desc || '';
        }
        if(settings.packages.family) {
          if(document.getElementsByName('pkg_family_title')[0]) document.getElementsByName('pkg_family_title')[0].value = settings.packages.family.title || '';
          if(document.getElementsByName('pkg_family_desc')[0]) document.getElementsByName('pkg_family_desc')[0].value = settings.packages.family.desc || '';
        }
      }
      // About
      if (settings.about) {
        if(document.getElementsByName('about_subtitle')[0]) document.getElementsByName('about_subtitle')[0].value = settings.about.subtitle || '';
        if(document.getElementsByName('about_title')[0]) document.getElementsByName('about_title')[0].value = settings.about.title || '';
        if(document.getElementsByName('about_description1')[0]) document.getElementsByName('about_description1')[0].value = settings.about.description1 || '';
        if(document.getElementsByName('about_description2')[0]) document.getElementsByName('about_description2')[0].value = settings.about.description2 || '';
        if(document.getElementsByName('about_image')[0]) document.getElementsByName('about_image')[0].value = settings.about.image || '';
      }
      // Owner
      if (settings.owner) {
        if(document.getElementsByName('owner_name')[0]) document.getElementsByName('owner_name')[0].value = settings.owner.name || '';
        if(document.getElementsByName('owner_title')[0]) document.getElementsByName('owner_title')[0].value = settings.owner.title || '';
        if(document.getElementsByName('owner_designation')[0]) document.getElementsByName('owner_designation')[0].value = settings.owner.designation || '';
        if(document.getElementsByName('owner_philosophy')[0]) document.getElementsByName('owner_philosophy')[0].value = settings.owner.philosophy || '';
        if(document.getElementsByName('owner_quote')[0]) document.getElementsByName('owner_quote')[0].value = settings.owner.quote || '';
        if(document.getElementsByName('owner_image')[0]) document.getElementsByName('owner_image')[0].value = settings.owner.image || '';
      }
    }
    
    // Override API endpoints in the existing script
    window.API_BASE = 'https://manali-backend.onrender.com';
    const originalFetch = window.fetch;
    window.fetch = function() {
      let [resource, config] = arguments;
      if (typeof resource === 'string' && resource.startsWith('/admin/api')) {
        resource = window.API_BASE + resource;
        config = config || {};
        config.headers = config.headers || {};
        config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('admin_token');
      }
      return originalFetch(resource, config);
    };

    document.addEventListener('DOMContentLoaded', loadDashboardData);
  </script>
</body>
</html>
`;

html = html.replace('</body>\n</html>', script);

fs.writeFileSync('public/admin/dashboard.html', html, 'utf8');
console.log("Converted successfully!");
