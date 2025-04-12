const app = (() => {
    // Estado de la aplicación
    let trips = [];
    
    // Polyfill para Safari
    if (!Date.prototype.toISOString) {
        Date.prototype.toISOString = function() {
            const pad = n => n < 10 ? '0' + n : n;
            return `${this.getUTCFullYear()}-${pad(this.getUTCMonth()+1)}-${pad(this.getUTCDate())}`;
        };
    }

    // Métodos públicos
    return {
        init() {
            this.loadTrips();
            this.setDefaultDates();
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
            
            if (trips.length === 0) {
                noTripsMsg.classList.remove('hidden');
                list.innerHTML = '';
                return;
            }
            
            noTripsMsg.classList.add('hidden');
            list.innerHTML = trips.map((trip, index) => `
                <div class="trip-card">
                    <button class="delete-btn" onclick="app.deleteTrip(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                    <div class="trip-content" onclick="app.showTripDetails(${index})">
                        <h3>${trip.name}</h3>
                        <p>${new Date(trip.startDate).toLocaleDateString('es-ES')} - 
                        ${new Date(trip.endDate).toLocaleDateString('es-ES')}</p>
                        ${trip.cities?.length ? `<p>Ciudades: ${trip.cities.join(', ')}</p>` : ''}
                    </div>
                </div>
            `).join('');
        },

        addTrip() {
            try {
                const name = document.getElementById('tripName').value;
                const startDate = document.getElementById('startDate').value;
                const endDate = document.getElementById('endDate').value;
                
                if (!name || !startDate || !endDate) {
                    throw new Error('Completa todos los campos');
                }

                trips.push({
                    name,
                    startDate: new Date(startDate).toISOString().split('T')[0],
                    endDate: new Date(endDate).toISOString().split('T')[0],
                    cities: []
                });

                localStorage.setItem('trips', JSON.stringify(trips));
                this.renderTrips();
                
                // Resetear formulario
                document.getElementById('tripName').value = '';
                document.getElementById('startDate').value = '';
                document.getElementById('endDate').value = '';

            } catch (error) {
                alert(error.message);
                console.error('Error:', error);
            }
        },

        deleteTrip(index) {
            if (confirm('¿Borrar este viaje permanentemente?')) {
                trips.splice(index, 1);
                localStorage.setItem('trips', JSON.stringify(trips));
                this.renderTrips();
            }
        },

        showTripDetails(index) {
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
            document.getElementById('mainView').classList.remove('hidden');
        },

        setDefaultDates() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('startDate').value = today;
            document.getElementById('endDate').value = today;
        }
    };
})();

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => app.init());