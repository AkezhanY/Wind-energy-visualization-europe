//  Инициализация карты 
const map = L.map('windMap').setView([54.5, 10], 5);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// Загрузка данных стран 
let infoData = {};
fetch("https://gist.githubusercontent.com/AkezhanY/24b42a3e4e430d781eebe59ea21d3f8a/raw/99e30cb36e57162d98115a3c77b0e5f2fb4ca22c/infoData.json")
  .then(res => res.json())
  .then(data => {
    infoData = data;
  });

// Загрузка маркеров и добавление на карту 
fetch("https://gist.githubusercontent.com/AkezhanY/fd100acc862e3408ab4e7043375ed074/raw/9d9e72e9afd72ec710fc09bf6e2e50180d808799/markers.json")
  .then(res => res.json())
  .then(markers => {
    markers.forEach(m => {
      const markerHtml = `<div class="map-button" onclick="showInfo('${m.country}')">${m.label}</div>`;
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: markerHtml,
        iconSize: [100, 30],
        iconAnchor: [50, 15]
      });

      L.marker([m.lat, m.lng], { icon }).addTo(map);
    });
  });

//  Модалка: открыть 
function showInfo(country) {
  document.getElementById("countryTitle").innerText = country;
  document.getElementById("countryDetails").innerText = infoData[country] || "No data available.";
  document.getElementById("infoModal").style.display = "block";
}

// Модалка: закрыть 
function closeModal() {
  document.getElementById("infoModal").style.display = "none";
}

// Закрытие по клику вне модалки
window.onclick = function (event) {
  const modal = document.getElementById("infoModal");
  if (event.target === modal) {
    closeModal();
  }
};

//  ГРАФИК ВОПРОС 1  СРАВНЕНИЕ СТРАН 
let windData = [];

fetch("https://gist.githubusercontent.com/AkezhanY/49b04de4db7a00d827661ecc72ddf4ac/raw/972f4672767fe26a11d94765c81ff940ed0abadb/windData.json")
  .then(res => res.json())
  .then(data => {
    windData = data;
    updateChart('turbines'); // инициализация
  });

function updateChart(metric) {
  const labels = {
    turbines: "Total Turbines",
    production: "Annual Production (billion kWh)",
    revenue: "Wind Revenue (€B)",
    exports: "Exports (TWh)",
    speed: "Wind Speed (m/s)"
  };

  const trace = {
    type: "bar",
    x: windData.map(item => item.country),
    y: windData.map(item => item[metric]),
    marker: { color: '#28a745' }
  };

  const layout = {
    title: labels[metric],
    xaxis: { title: "", tickangle: -45 },
    yaxis: { title: labels[metric] },
    margin: { l: 60, r: 30, t: 60, b: 120 },
    height: 600
  };

  Plotly.newPlot("barChart", [trace], layout, { responsive: true });
}

//ГРАФИК ВОПРОС 2 — ТАЙМСЕРИЯ 
let chartInstance;
let loadedData = null;

async function loadChartData() {
  try {
    const response = await fetch(
      'https://gist.githubusercontent.com/AkezhanY/c2f794ef3fd3a3d68b158727d129e30f/raw/cad021decbcf99b397c78424e02a70964599c822/turbine_timeseries.json'
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    loadedData = await response.json();

    showChart('turbines_full'); // Инициализация графика
  } catch (err) {
    console.error('❌ Error loading chart data:', err);
  }
}

function showChart(type) {
  if (!loadedData) return;

  const ctx = document.getElementById("windTurbineChart").getContext("2d");
  if (chartInstance) chartInstance.destroy();

  const labels = loadedData.labels;
  const datasets = loadedData.datasets?.[type] || [];

  const yLabel = type.includes('production') ? 'Energy Production (TWh)' : 'Number of Wind Turbines';

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            boxWidth: 12,
            padding: 10
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        },
        title: {
          display: true,
          text: yLabel
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      scales: {
        x: {
          title: { display: true, text: 'Year' },
          ticks: { autoSkip: false }
        },
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: yLabel
          },
          ticks: {
            callback: value => value.toLocaleString('en-US')
          }
        }
      }
    }
  });
}

// Автоматическая загрузка графика при старте страницы
window.addEventListener('load', loadChartData);






// два небольших графика
fetch('https://gist.githubusercontent.com/AkezhanY/f84445a694c7737bdc07673bb855d444/raw/5d09816c5a526fa69053763fcd6bcab86950e153/co2_fossil_data.json')
  .then(res => res.json())
  .then(data => {
    const years = data.years;
    const co2Saved = data.co2Saved;
    const fossilReduced = data.fossilReduced;

    const co2Ctx = document.getElementById("co2Chart").getContext("2d");
    const fossilCtx = document.getElementById("fossilChart").getContext("2d");

    new Chart(co2Ctx, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [{
          label: 'CO₂ Saved (Mt)',
          data: co2Saved,
          backgroundColor: 'orange'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'CO₂ Saved by Wind Energy'
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.raw} Mt`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Million Tons (Mt)' }
          }
        }
      }
    });

    new Chart(fossilCtx, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [{
          label: 'Fossil Fuel Reduction (%)',
          data: fossilReduced,
          backgroundColor: 'gold'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Reduction of Fossil Dependency'
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.raw}%`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Percentage (%)' }
          }
        }
      }
    });
  })
  .catch(err => console.error('Error loading CO2/Fossil data:', err));

// пред последний график на вырос
fetch('https://gist.githubusercontent.com/AkezhanY/6e48c023e41118169b36afa223d4aa2b/raw/0bd0f7b649e3893e976d7a8239fd04ec74ad3306/growth_2024_2030.json')
  .then(res => res.json())
  .then(data => {
    const ctx = document.getElementById("europeGrowthChart").getContext("2d");

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.year),
        datasets: [{
          label: 'Turbines in Europe',
          data: data.map(d => d.value),
          backgroundColor: '#28a745'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Wind Energy Growth in Europe (2024–2030)'
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.raw.toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Year' },
            ticks: { autoSkip: false }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Number of Turbines' },
            ticks: {
              callback: value => value.toLocaleString()
            }
          }
        }
      }
    });
  })
  .catch(err => console.error('Failed to load data:', err));
