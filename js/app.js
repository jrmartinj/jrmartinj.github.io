const app = (() => {
    let trips = [];
    
    // Polyfill para Safari
    if (!Date.prototype.toISOString) {
        Date.prototype.toISOString = function() {
            const pad = n => n < 10 ? '0' + n : n;
            return `${this.getUTCFullYear()}-${pad(this.getUTCMonth()+1)}-${pad(this.getUTCDate())}`;
        };
    }

    return {
        init() {
            this.loadTrips();
            this.setDefaultDates();
            this.handleSharedTrip();
            this.renderTrips();
        },

        loadTrips() {
            try {
                const storedTrips = localStorage.getItem('trips');
                trips = storedTrips ? JSON.parse(storedTrips) : [];
                if (!Array.isArray(trips)) throw new Error('Formato inválido');
            } catch (error) {
                console.error('Error cargando viajes:', error);
                trips = [];
                localStorage.setItem('trips', JSON.stringify(trips));
            }
        },

        renderTrips() {
            const list = document.getElementById('tripsList');
            const noTripsMsg = document.getElementById('noTripsMessage');
            
            list.innerHTML = trips.map((trip, index) => `
                <div class="trip-card">
                    <button class="delete-btn" 
                            onclick="app.deleteTrip(${index}, event)"
                            aria-label="Eliminar viaje">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="share-btn"
                            onclick="app.copyShareLink(${index}, event)"
                            aria-label="Compartir viaje">
                        <i class="fas fa-share"></i>
                    </button>
                    <div class="trip-content" onclick="app.showTripDetails(${index})">
                        <h3>${trip.name}</h3>
                        <p>${new Date(trip.startDate).toLocaleDateString('es-ES')} - 
                           ${new Date(trip.endDate).toLocaleDateString('es-ES')}</p>
                        ${trip.cities?.length ? `<p class="cities">Ciudades: ${trip.cities.join(', ')}</p>` : ''}
                    </div>
                </div>
            `).join('');

            noTripsMsg.classList.toggle('hidden', trips.length > 0);
            
            if (trips.length > 0) {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });
            }
        },

        addTrip() {
            const name = document.getElementById('tripName').value.trim();
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            if (!name || !startDate || !endDate) {
                alert('Por favor completa todos los campos');
                return;
            }

            trips.push({
                name,
                startDate: new Date(startDate).toISOString().split('T')[0],
                endDate: new Date(endDate).toISOString().split('T')[0],
                cities: []
            });

            localStorage.setItem('trips', JSON.stringify(trips));
            this.renderTrips();
            
            document.getElementById('tripName').value = '';
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
        },

        deleteTrip(index, event) {
            event.stopPropagation();
            event.preventDefault();
            
            if (confirm('¿Borrar este viaje permanentemente?')) {
                const updatedTrips = trips.filter((_, i) => i !== index);
                trips = updatedTrips;
                
                localStorage.setItem('trips', JSON.stringify(trips));
                
                setTimeout(() => {
                    this.renderTrips();
                }, 50);
            }
        },

        generateShareLink(trip) {
            const data = JSON.stringify(trip);
            const base64 = btoa(unescape(encodeURIComponent(data)));
            return `${window.location.origin}${window.location.pathname}?shared=${base64}`;
        },

        copyShareLink(index, event) {
            event.stopPropagation();
            const trip = trips[index];
            const link = this.generateShareLink(trip);
            
            navigator.clipboard.writeText(link).then(() => {
                alert('¡Enlace copiado al portapapeles!\nComparte este enlace con tus amigos');
            }).catch(err => {
                console.error('Error al copiar:', err);
                alert('No se pudo copiar el enlace. Intenta manualmente:\n' + link);
            });
        },

        handleSharedTrip() {
            const urlParams = new URLSearchParams(window.location.search);
            const sharedData = urlParams.get('shared');
            
            if (sharedData) {
                try {
                    const decodedData = decodeURIComponent(atob(sharedData));
                    const trip = JSON.parse(decodedData);
                    this.showSharedTrip(trip);
                } catch (error) {
                    console.error('Error al decodificar viaje compartido:', error);
                    alert('Enlace inválido o corrupto');
                }
            }
        },

        showSharedTrip(trip) {
            document.getElementById('mainView').classList.add('hidden');
            document.getElementById('detailView').classList.add('hidden');
            
            const sharedView = document.createElement('div');
            sharedView.id = 'sharedView';
            sharedView.innerHTML = `
                <button class="primary" onclick="app.showMainView()">
                    <i class="fas fa-arrow-left"></i> Volver a mis viajes
                </button>
                <h2>Viaje compartido: ${trip.name}</h2>
                <div class="trip-card">
                    <p><i class="fas fa-calendar"></i> ${new Date(trip.startDate).toLocaleDateString('es-ES')} - ${new Date(trip.endDate).toLocaleDateString('es-ES')}</p>
                    ${trip.cities?.length ? `<p class="cities"><i class="fas fa-city"></i> ${trip.cities.join(', ')}</p>` : ''}
                </div>
                <p class="share-notice">Este es un viaje compartido de solo lectura</p>
            `;
            
            document.querySelector('.container').appendChild(sharedView);
        },

        showTripDetails(index) {
            if (index < 0 || index >= trips.length) return;
            
            const trip = trips[index];
            document.getElementById('detailTitle').textContent = trip.name;
            document.getElementById('detailDates').textContent = 
                `${new Date(trip.startDate).toLocaleDateString('es-ES')} - ${new Date(trip.endDate).toLocaleDateString('es-ES')}`;
            document.getElementById('detailCities').textContent = 
                trip.cities?.length ? `Ciudades: ${trip.cities.join(', ')}` : '';
            
            document.getElementById('mainView').classList.add('hidden');
            document.getElementById('detailView').classList.remove('hidden');
        },

        showMainView() {
            document.getElementById('detailView').classList.add('hidden');
            document.getElementById('sharedView')?.remove();
            document.getElementById('mainView').classList.remove('hidden');
            this.renderTrips();
        },

        setDefaultDates() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('startDate').value = today;
            document.getElementById('endDate').value = today;
        }
    };
})();

// Inicialización
document.addEventListener('DOMContentLoaded', () => app.init());
