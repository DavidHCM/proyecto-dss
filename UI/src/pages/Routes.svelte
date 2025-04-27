<script>
    import { onMount } from 'svelte';
    import { authMiddleware, getUserType } from '../lib/scripts/verifyAcess.js';
    import { logout, change } from '../lib/scripts/homeControllers/homeA.controller.js';
    import { fetchDeliveries, fetchDeliveriesDriver } from '../lib/scripts/routesController/routesA.controller.js';
    import Swal from "sweetalert2";
    import socket from '../lib/scripts/socketClient.js';

    let origin = '';
    let destination = '';
    let map, directionsService, directionsRenderer, autocompleteOrigin, autocompleteDestination;
    const MapsKey = "a";
    let isAuthenticated = false;
    let userType = '';

    onMount(async () => {
        isAuthenticated = await authMiddleware(true);
        if (isAuthenticated) {
            const token = localStorage.getItem('token');
            const user = JSON.parse(atob(token.split('.')[1]));

            if (user && user.userId && user.role) {
                socket.emit('registerUser', { userId: user.userId, role: user.role });
            }
            userType = await getUserType();
            if (userType === 'admin') {
                await fetchDeliveries();

                document.querySelector('.delivery-list-container').addEventListener('click', (event) => {
                    const target = event.target;
                    if (target.classList.contains('select-route-button')) {
                        const pickupLocation = target.getAttribute('data-pickup');
                        const deliveryLocation = target.getAttribute('data-destination');

                        // Asignar valores a los inputs y variables
                        document.getElementById('origin').value = pickupLocation;
                        document.getElementById('destination').value = deliveryLocation;

                        origin = pickupLocation;
                        destination = deliveryLocation;

                        Swal.fire("Dirección seleccionada", `Origen: ${pickupLocation}\nDestino: ${deliveryLocation}`, "success");
                    }
                });

            } else if(userType === 'driver') {
                await fetchDeliveriesDriver();

                document.querySelector('.delivery-list-container').addEventListener('click', (event) => {
                    const target = event.target;
                    if (target.classList.contains('select-route-button')) {
                        const pickupLocation = target.getAttribute('data-pickup');
                        const deliveryLocation = target.getAttribute('data-destination');


                        document.getElementById('origin').value = pickupLocation;
                        document.getElementById('destination').value = deliveryLocation;

                        origin = pickupLocation;
                        destination = deliveryLocation;

                        Swal.fire("Dirección seleccionada", `Origen: ${pickupLocation}\nDestino: ${deliveryLocation}`, "success");
                    }
                });
            } else {
                await fetchDeliveries();

                document.querySelector('.delivery-list-container').addEventListener('click', (event) => {
                    const target = event.target;
                    if (target.classList.contains('select-route-button')) {
                        const pickupLocation = target.getAttribute('data-pickup');
                        const deliveryLocation = target.getAttribute('data-destination');

                        // Asignar valores a los inputs y variables
                        document.getElementById('origin').value = pickupLocation;
                        document.getElementById('destination').value = deliveryLocation;

                        origin = pickupLocation;
                        destination = deliveryLocation;

                        Swal.fire("Dirección seleccionada", `Origen: ${pickupLocation}\nDestino: ${deliveryLocation}`, "success");
                    }
                });
            }
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${MapsKey}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        window.initMap = () => {
            const mapDiv = document.getElementById('map');
            if (mapDiv) {
                map = new google.maps.Map(mapDiv, {
                    center: { lat: 20.659698, lng: -103.349609 }, // Guadalajara
                    zoom: 12,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    streetViewControl: false,
                });

                // Agregar la capa de tráfico
                const trafficLayer = new google.maps.TrafficLayer();
                trafficLayer.setMap(map);

                directionsService = new google.maps.DirectionsService();
                directionsRenderer = new google.maps.DirectionsRenderer();
                directionsRenderer.setMap(map);

                // Inicializar Autocompletado
                const originInput = document.getElementById('origin');
                const destinationInput = document.getElementById('destination');

                autocompleteOrigin = new google.maps.places.Autocomplete(originInput);
                autocompleteDestination = new google.maps.places.Autocomplete(destinationInput);

                autocompleteOrigin.addListener('place_changed', () => {
                    const place = autocompleteOrigin.getPlace();
                    origin = place.formatted_address || place.name;
                });

                autocompleteDestination.addListener('place_changed', () => {
                    const place = autocompleteDestination.getPlace();
                    destination = place.formatted_address || place.name;
                });
            } else {
                console.error('El div con id "map" no se encuentra.');
            }
        };

    });

    const calculateRoute = () => {
        if (!origin || !destination) {

            Swal.fire({
                title: "Y las direcciones?",
                text: "Favor de ingresar las dos direcciones",
                icon: "error"
            });
            return;
        }

        const request = {
            origin,
            destination,
            travelMode: 'DRIVING',
        };

        directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(result);
            } else {
                Swal.fire({
                    title: "Algo salio mal!",
                    text: "No se pudo calcular la ruta, revisa la direccion",
                    icon: "error"
                });
            }
        });
    };
</script>
<main>
    <script src="https://kit.fontawesome.com/549e1abe3e.js" crossorigin="anonymous"></script>

    {#if isAuthenticated}
        {#if userType === 'admin'}
            <section class="layout">
                <div class="header">
                    <div class="header-01">
                        <div class="logo">
                            <div class="text">
                                <div class="logo2">
                                    <svg width="60" height="48" viewBox="0 0 125 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path opacity="0.75" d="M0.309814 100.455C27.8915 100.455 50.2822 78.0524 50.2822 50.4563C50.2822 22.8602 27.8915 0.457764 0.309814 0.457764V24.5656V100.455Z" fill="#536DFE"/>
                                        <path opacity="0.75" d="M24.8699 100.455C52.4515 100.455 74.8423 78.0524 74.8423 50.4563C74.8423 22.8602 52.4515 0.457764 24.8699 0.457764V24.5656V100.455Z" fill="#3F51B5"/>
                                        <path opacity="0.75" d="M49.8948 100.455C77.4764 100.455 99.8672 78.0524 99.8672 50.4563C99.8672 22.8602 77.4764 0.457764 49.8948 0.457764V24.5656V100.455Z" fill="#F44336"/>
                                        <path opacity="0.75" d="M74.8423 100.455C102.424 100.455 124.815 78.0524 124.815 50.4563C124.815 22.8602 102.424 0.457764 74.8423 0.457764V24.5656V100.455Z" fill="#FFA000"/>
                                    </svg>
                                </div>

                            </div>
                        </div>
                        <div class="frame-53">
                            <button on:click="{logout}" class="avatar">
                                <i class="fa-solid fa-right-from-bracket" style="color: #212121;"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="leftSide">
                    <div class="dashboard-sidebar">
                        <div class="frame">
                            <!--- el class de content solo es para tenerlo como marcado el icono --->
                            <button class="content2" on:click={() => change('')}>
                                <div class="icon">
                                    <i class="fa-solid fa-table-columns" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Dashboard</div>
                                </div>
                            </button>

                            <!--- on:click={change} --->
                            <button class="content2" on:click={() => change('deliveries')}>
                                <div class="icon">
                                    <i class="fa-solid fa-truck" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Envios</div>
                                </div>
                            </button>
                            <button class="content2" on:click={() => change('incidents')}>
                                <div class="icon">
                                    <i class="fa-solid fa-flag" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Incidentes</div>
                                </div>
                            </button>
                            <button class="content" >
                                <div class="icon">
                                    <i class="fa-solid fa-route" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Manejo de rutas</div>
                                </div>
                            </button>
                            <button class="content2" on:click={() => change('users')}>
                                <div class="icon">
                                    <i class="fa-solid fa-users" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Usuarios</div>
                                </div>
                            </button>
                            <button class="content2" on:click={() => change('ranking')}>
                                <div class="icon">
                                    <i class="fa-solid fa-ranking-star" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Ranking</div>
                                </div>
                            </button>
                            <button class="content2" on:click={() => change('notifications')}>
                                <div class="icon">
                                    <i class="fa-solid fa-envelope" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Notificaciones</div>
                                </div>
                            </button>
                            <button class="content2" on:click={() => change('support')}>
                                <div class="icon">
                                    <i class="fa-solid fa-comment" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Chat</div>
                                </div>
                            </button>
                        </div>
                        <button class="bye-wind" on:click={() => change('profile')}>
                            <div class="icon">
                                <i class="fa-solid fa-user" style="color: #212121;"></i>
                            </div>
                            <div class="text3">
                                <div class="text2">Perfil</div>
                            </div>
                        </button>
                    </div>

                </div>
                <div class="body">
                    <div>
                        <label class="origin-style" for="origin">Dirección de inicio:</label>
                        <input class="input-box" id="origin" type="text" placeholder="Introduce la dirección de inicio" />

                        <label class="destionation-style" for="destination">Dirección de destino:</label>
                        <input class="input-box" id="destination" type="text" placeholder="Introduce la dirección de destino" />

                        <button class="enter-search" on:click={calculateRoute}>Calcular Ruta</button>
                    </div>

                    <div id="map" style="width: 100%; height: 400px; margin-top: 20px;"></div>

                    <div class="grow1 fixed-size-deli">
                        <h3 class="delivery-title">Envios</h3>
                        <div class="delivery-list-container">

                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div class="footer-01">
                        <div class="greelogix-202-x-all-rights-reserved">
                            <div class="greelogix-202-x-all-rights-reserved2">
                                IGE, empresa de envios.
                            </div>
                        </div>
                    </div>

                </div>
            </section>



        {:else if userType === 'driver'}
            <section class="layout-driver">
                <div class="header">
                    <div class="header-01">
                        <div class="logo">
                            <div class="text">
                                <div class="logo2">
                                    <svg width="60" height="48" viewBox="0 0 125 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path opacity="0.75" d="M0.309814 100.455C27.8915 100.455 50.2822 78.0524 50.2822 50.4563C50.2822 22.8602 27.8915 0.457764 0.309814 0.457764V24.5656V100.455Z" fill="#536DFE"/>
                                        <path opacity="0.75" d="M24.8699 100.455C52.4515 100.455 74.8423 78.0524 74.8423 50.4563C74.8423 22.8602 52.4515 0.457764 24.8699 0.457764V24.5656V100.455Z" fill="#3F51B5"/>
                                        <path opacity="0.75" d="M49.8948 100.455C77.4764 100.455 99.8672 78.0524 99.8672 50.4563C99.8672 22.8602 77.4764 0.457764 49.8948 0.457764V24.5656V100.455Z" fill="#F44336"/>
                                        <path opacity="0.75" d="M74.8423 100.455C102.424 100.455 124.815 78.0524 124.815 50.4563C124.815 22.8602 102.424 0.457764 74.8423 0.457764V24.5656V100.455Z" fill="#FFA000"/>
                                    </svg>
                                </div>

                            </div>
                        </div>
                        <div class="frame-53">
                            <button on:click="{logout}" class="avatar">
                                <i class="fa-solid fa-right-from-bracket" style="color: #212121;"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="leftSide">
                    <div class="dashboard-sidebar">
                        <div class="frame">
                            <!--- el class de content solo es para tenerlo como marcado el icono --->
                            <button class="content2" on:click={() => change('')}>
                                <div class="icon">
                                    <i class="fa-solid fa-table-columns" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Dashboard</div>
                                </div>
                            </button>
                            <button class="content2" on:click={() => change('deliveries')}>
                                <div class="icon">
                                    <i class="fa-solid fa-truck" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Envios</div>
                                </div>
                            </button>
                            <button class="content2" on:click={() => change('incidents')}>
                                <div class="icon">
                                    <i class="fa-solid fa-flag" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Incidentes</div>
                                </div>
                            </button>
                            <button class="content" >
                                <div class="icon">
                                    <i class="fa-solid fa-route" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Manejo de rutas</div>
                                </div>
                            </button>
                            <button class="content2" on:click={() => change('ranking')}>
                                <div class="icon">
                                    <i class="fa-solid fa-ranking-star" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Ranking</div>
                                </div>
                            </button>
                            <button class="content2" on:click={() => change('notifications')}>
                                <div class="icon">
                                    <i class="fa-solid fa-envelope" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Notificaciones</div>
                                </div>
                            </button>
                            <button class="content2" on:click={() => change('support')}>
                                <div class="icon">
                                    <i class="fa-solid fa-comment" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Chat</div>
                                </div>
                            </button>
                        </div>
                        <button class="bye-wind" on:click={() => change('profile')}>
                            <div class="icon">
                                <i class="fa-solid fa-user" style="color: #212121;"></i>
                            </div>
                            <div class="text3">
                                <div class="text2">Perfil</div>
                            </div>
                        </button>
                    </div>

                </div>
                <div class="body">
                    <div>
                        <label class="origin-style" for="origin">Dirección de inicio:</label>
                        <input class="input-box" id="origin" type="text" placeholder="Introduce la dirección de inicio" />

                        <label class="destionation-style" for="destination">Dirección de destino:</label>
                        <input class="input-box" id="destination" type="text" placeholder="Introduce la dirección de destino" />

                        <button class="enter-search" on:click={calculateRoute}>Calcular Ruta</button>
                    </div>

                    <div id="map" style="width: 100%; height: 400px; margin-top: 20px;"></div>

                    <div class="grow1 fixed-size-deli">
                        <h3 class="delivery-title">Envios</h3>
                        <div class="delivery-list-container">

                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div class="footer-01">
                        <div class="greelogix-202-x-all-rights-reserved">
                            <div class="greelogix-202-x-all-rights-reserved2">
                                IGE, empresa de envios.
                            </div>
                        </div>
                    </div>

                </div>
            </section>

        {:else if userType === 'support'}
            <section class="layout">
                <div class="header">
                    <div class="header-01">
                        <div class="logo">
                            <div class="text">
                                <div class="logo2">
                                    <svg width="60" height="48" viewBox="0 0 125 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path opacity="0.75" d="M0.309814 100.455C27.8915 100.455 50.2822 78.0524 50.2822 50.4563C50.2822 22.8602 27.8915 0.457764 0.309814 0.457764V24.5656V100.455Z" fill="#536DFE"/>
                                        <path opacity="0.75" d="M24.8699 100.455C52.4515 100.455 74.8423 78.0524 74.8423 50.4563C74.8423 22.8602 52.4515 0.457764 24.8699 0.457764V24.5656V100.455Z" fill="#3F51B5"/>
                                        <path opacity="0.75" d="M49.8948 100.455C77.4764 100.455 99.8672 78.0524 99.8672 50.4563C99.8672 22.8602 77.4764 0.457764 49.8948 0.457764V24.5656V100.455Z" fill="#F44336"/>
                                        <path opacity="0.75" d="M74.8423 100.455C102.424 100.455 124.815 78.0524 124.815 50.4563C124.815 22.8602 102.424 0.457764 74.8423 0.457764V24.5656V100.455Z" fill="#FFA000"/>
                                    </svg>
                                </div>

                            </div>
                        </div>
                        <div class="frame-53">
                            <button on:click="{logout}" class="avatar">
                                <i class="fa-solid fa-right-from-bracket" style="color: #212121;"></i>
                            </button>
                        </div>
                    </div>

                </div>
                <div class="leftSide">
                    <div class="dashboard-sidebar">
                        <div class="frame">
                            <!--- el class de content solo es para tenerlo como marcado el icono --->
                            <button class="content2" on:click={() => change('')}>
                                <div class="icon">
                                    <i class="fa-solid fa-table-columns" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Dashboard</div>
                                </div>
                            </button>
                            <button class="content2" on:click={() => change('deliveries')}>
                                <div class="icon">
                                    <i class="fa-solid fa-truck" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Envios</div>
                                </div>
                            </button>
                            <button class="content2" on:click={() => change('incidents')}>
                                <div class="icon">
                                    <i class="fa-solid fa-flag" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Incidentes</div>
                                </div>
                            </button>
                            <button class="content" >
                                <div class="icon">
                                    <i class="fa-solid fa-route" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Manejo de rutas</div>
                                </div>
                            </button>
                            <button class="content2" on:click={() => change('ranking')}>
                                <div class="icon">
                                    <i class="fa-solid fa-ranking-star" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Ranking</div>
                                </div>
                            </button>
                            <button class="content2" on:click={() => change('notifications')}>
                                <div class="icon">
                                    <i class="fa-solid fa-envelope" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Notificaciones</div>
                                </div>
                            </button>
                            <button class="content2" on:click={() => change('support')}>
                                <div class="icon">
                                    <i class="fa-solid fa-comment" style="color: #212121;"></i>
                                </div>
                                <div class="text">
                                    <div class="text2">Chat</div>
                                </div>
                            </button>
                        </div>
                        <button class="bye-wind" on:click={() => change('profile')}>
                            <div class="icon">
                                <i class="fa-solid fa-user" style="color: #212121;"></i>
                            </div>
                            <div class="text3">
                                <div class="text2">Perfil</div>
                            </div>
                        </button>
                    </div>

                </div>
                <div class="body">
                    <div>
                        <label class="origin-style" for="origin">Dirección de inicio:</label>
                        <input class="input-box" id="origin" type="text" placeholder="Introduce la dirección de inicio" />

                        <label class="destionation-style" for="destination">Dirección de destino:</label>
                        <input class="input-box" id="destination" type="text" placeholder="Introduce la dirección de destino" />

                        <button class="enter-search" on:click={calculateRoute}>Calcular Ruta</button>
                    </div>

                    <div id="map" style="width: 100%; height: 400px; margin-top: 20px;"></div>

                    <div class="grow1 fixed-size-deli">
                        <h3 class="delivery-title">Envios</h3>
                        <div class="delivery-list-container">

                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div class="footer-01">
                        <div class="greelogix-202-x-all-rights-reserved">
                            <div class="greelogix-202-x-all-rights-reserved2">
                                IGE, empresa de envios.
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        {:else}
            <p>No tienes acceso a este contenido.</p>
        {/if}
    {:else}
        <p>Autenticación requerida. Por favor, inicia sesión.</p>
    {/if}
    <style>


        /* Estilos para los labels */
        .origin-style,
        .destionation-style {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: bold;
            color: #333;
        }

        /* Estilo de los inputs */
        .input-box {
            width: 97%;
            padding: 10px;
            margin-bottom: 16px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            outline: none;
            transition: border-color 0.3s ease;
        }

        .input-box:focus {
            border-color: #536dfe;
        }

        /* Botón de búsqueda */
        .enter-search {
            width: 100%;
            padding: 12px;
            background-color: #536dfe;
            color: white;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: background-color 0.3s ease;
        }

        .enter-search:hover {
            background-color: #3f51b5;
        }

        /* Estilo del mapa */
        #map {
            width: 100%;
            height: 400px;
            margin-top: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }



        .fixed-size-deli {
            height: 280px;
            width: 100%;
            background-color: #fafafa;
            border: 1px solid #ccc;
            border-radius: 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0;
            overflow: hidden;
        }

        .select-route-button {
            background: var(--primary, #0f161e);
            border-radius: 8px;
            border: none;
            padding: 8px 12px;
            color: #ffffff;
            font-family: "Inter-Medium", sans-serif;
            font-size: 14px;
            font-weight: 400;
            cursor: pointer;
            transition: background 0.3s ease, transform 0.2s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            margin-right: 10px;
        }

        .select-route-button:hover {
            background: var(--primary-dark, #24354b);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .select-route-button:active {
            background: var(--primary-darker, #0b1218);
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }



    </style>
</main>
