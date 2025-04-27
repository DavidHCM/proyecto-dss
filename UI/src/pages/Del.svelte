<script>
    import { onMount } from 'svelte';
    import { authMiddleware, getUserType } from '../lib/scripts/verifyAcess.js';
    import { logout, change } from '../lib/scripts/homeControllers/homeA.controller.js';
    import {addDelivery, fetchDeliveries,deleteDelivery, editDelivery, fetchAllDeliveries} from "../lib/scripts/deliveryControllers/deliveryA.controller.js"
    import { fetchDeliveriesDriver, editDeliveryDriver } from "../lib/scripts/deliveryControllers/deliveryD.controller.js"
    import { fetchAllDeliveriesSupport } from "../lib/scripts/deliveryControllers/deliveryS.controller.js"
    import socket from '../lib/scripts/socketClient.js';

    let isAuthenticated = false;
    let userType = '';
    let selectedFilter = 'in-progress';


    async function loadDeliveries() {
        if (selectedFilter === 'in-progress') {
            await fetchDeliveries();
        } else {
            await fetchAllDeliveries();
        }
    }

    function handleButtonClick(event) {
        const target = event.target;

        if (target.classList.contains('delete-button')) {
            const deliveryId = target.getAttribute('data-id');
            deleteDelivery(deliveryId);
        }
        else if (target.classList.contains('edit-button')) {
            const deliveryId = target.getAttribute('data-id');
            editDelivery(deliveryId);
        }
        else if (target.classList.contains('edit-button-driver')) {
            const deliveryId = target.getAttribute('data-id');
            editDeliveryDriver(deliveryId);
        }
    }


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
            } else if(userType === 'driver') {
                await fetchDeliveriesDriver();
            } else {
                await fetchAllDeliveriesSupport();
            }
        }
        const MapsKey = "a";
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${MapsKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    });

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
                            <button class="content" >
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
                            <button class="content2" on:click={() => change('routes')}>
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
                    <section class="layout-inside-deliveries">
                        <div class="header-deliveries">
                            <div class="header-05">
                                <div class="frame-56">
                                    <button class="button2" on:click={() => addDelivery()}>
                                        <div class="text-container2">
                                            <div class="button-text2">Agregar envio</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            <div class="filter-options">
                                <label class="radio-container">
                                    <input type="radio" name="deliveryFilter" value="in-progress" bind:group={selectedFilter} on:change={loadDeliveries} checked>
                                    <span class="custom-radio"></span>
                                    Pedidos en Progreso
                                </label>
                                <label class="radio-container">
                                    <input type="radio" name="deliveryFilter" value="all" bind:group={selectedFilter} on:change={loadDeliveries}>
                                    <span class="custom-radio"></span>
                                    Todos los Pedidos
                                </label>
                            </div>

                        </div>

                        <div class="main-deliveries">
                            <div class="grow1 fixed-size">
                                <h3 class="delivery-title">Envios</h3>
                                <div class="delivery-list-container" on:click={handleButtonClick}></div>

                            </div>
                        </div>
                    </section>
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
                            <button class="content">
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
                            <button class="content2" on:click={() => change('routes')}>
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
                    <section class="layout-inside-deliveries">
                        <div class="header-deliveries">

                            <div class="header-05">
                                <div class="frame-56">

                                </div>
                            </div>

                        </div>

                        <div class="main-deliveries">
                            <div class="grow1 fixed-size">
                                <h3 class="delivery-title">Envios</h3>
                                <div class="delivery-list-container"  on:click={handleButtonClick}></div>

                            </div>
                        </div>
                    </section>
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
                            <button class="content" >
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
                            <button class="content2" on:click={() => change('routes')}>
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
                    <section class="layout-inside-deliveries">
                        <div class="header-deliveries">

                            <div class="header-05">
                                <div class="frame-56">

                                </div>
                            </div>

                        </div>

                        <div class="main-deliveries">
                            <div class="grow1 fixed-size">
                                <h3 class="delivery-title">Envios</h3>
                                <div class="delivery-list-container"  ></div>

                            </div>
                        </div>
                    </section>
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
            <p></p>
        {/if}
    {:else}
        <p></p>
    {/if}
<style>
    .fixed-size{
        height: 850px; !important;
    }
    .pac-container {
        z-index: 9999 !important; /* Higher than SweetAlert modal */
    }
</style>
</main>
