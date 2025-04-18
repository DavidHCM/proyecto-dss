<script>
    import { onMount } from 'svelte';
    import { authMiddleware, getUserType } from '../lib/scripts/verifyAcess.js';
    import { logout, change } from '../lib/scripts/homeControllers/homeA.controller.js';
    import socket from '../lib/scripts/socketClient.js';

    let isAuthenticated = false;
    let userType = '';
    let rooms = null;
    let currentRoom = null;
    let messages = [];
    let messageInput = '';
    let userName = '';

    onMount(async () => {
        isAuthenticated = await authMiddleware(true);
        if (isAuthenticated) {
            const token = localStorage.getItem('token');
            const user = JSON.parse(atob(token.split('.')[1]));
            userName = user.name;

            if (user && user.userId && user.role) {
                socket.emit('registerUser', { userId: user.userId, role: user.role });
            }

            socket.emit('registerUserChat', { token });

            socket.on('loadMessages', (loadedMessages) => {
                const token = localStorage.getItem('token');
                const user = JSON.parse(atob(token.split('.')[1]));

                messages = loadedMessages.map(({ fromUserId, content }) => ({
                    username: fromUserId === user.userId ? userName : 'Otro Usuario',
                    message: content,
                    type: fromUserId === user.userId ? 'sent' : 'received',
                }));
            });



            socket.on('userJoined', ({ message, username }) => {
                if (username !== userName) {
                    messages = [...messages, { username: 'Sistema', message, type: 'joined' }];
                }
            });

            socket.on('userLeft', ({ message }) => {
                messages = [...messages, { username: 'Sistema', message, type: 'left' }];
            });

            socket.on('receiveMessage', ({ username, message, roomName }) => {
                console.log('Mensaje procesado:', {
                    username,
                    message,
                    roomName,
                    type: username === userName ? 'sent' : 'received',
                });

                if (roomName === currentRoom) {
                    messages = [
                        ...messages,
                        {
                            username,
                            message,
                            type: username === userName ? 'sent' : 'received',
                        },
                    ];
                }
            });



            userType = await getUserType();
            if (userType === 'admin') {
                rooms = ['general', 'admin', 'driver', 'support'];
            } else if(userType === 'driver') {
                rooms = ['general', 'driver'];
            } else {
                rooms = ['general', 'support'];
            }
        }
    });

    function joinRoom(room) {
        currentRoom = room;
        messages = [];
        const token = localStorage.getItem('token');
        const user = JSON.parse(atob(token.split('.')[1]));

        socket.emit('joinRoom', { roomName: room, username: user.userId });
    }

    function sendMessage() {
        if (!messageInput.trim()) return;

        const token = localStorage.getItem('token');
        const user = JSON.parse(atob(token.split('.')[1]));


        socket.emit('sendMessage', {
            roomName: currentRoom,
            message: messageInput.trim(),
            userId: user.userId,
        });


        messages = [
            ...messages,
            {
                username: user.name,
                message: messageInput.trim(),
                type: 'sent',
            },
        ];

        messageInput = '';
    }


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
                            <button class="content" >
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
                    <div class="chat-container">
                        <!-- Lista de salas -->
                        <div class="rooms">
                            {#each rooms as room}
                                <button
                                        class="room-button {room === currentRoom ? 'active' : ''}"
                                        on:click={() => joinRoom(room)}
                                >
                                    {room}
                                </button>
                            {/each}
                        </div>

                        <!-- Mensajes de la sala -->
                        <div class="chat">
                            {#if currentRoom}
                                <div class="messages">
                                    {#each messages as { username, message, type }}
                                        <div class="message {type}">
                                            <strong>{username}</strong>: {message}
                                        </div>
                                    {/each}
                                </div>
                                <div class="input">
                                    <input
                                            type="text"
                                            bind:value="{messageInput}"
                                            placeholder="Escribe un mensaje..."
                                    />
                                    <button on:click="{sendMessage}">Enviar</button>
                                </div>
                            {:else}
                                <p>Por favor selecciona una sala para comenzar a chatear.</p>
                            {/if}
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
                            <button class="content" >
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
                    <div class="chat-container">
                        <!-- Lista de salas -->
                        <div class="rooms">
                            {#each rooms as room}
                                <button
                                        class="room-button {room === currentRoom ? 'active' : ''}"
                                        on:click={() => joinRoom(room)}
                                >
                                    {room}
                                </button>
                            {/each}
                        </div>

                        <!-- Mensajes de la sala -->
                        <div class="chat">
                            {#if currentRoom}
                                <div class="messages">
                                    {#each messages as { username, message, type }}
                                        <div class="message {type}">
                                            <strong>{username}</strong>: {message}
                                        </div>
                                    {/each}
                                </div>
                                <div class="input">
                                    <input
                                            type="text"
                                            bind:value="{messageInput}"
                                            placeholder="Escribe un mensaje..."
                                    />
                                    <button on:click="{sendMessage}">Enviar</button>
                                </div>
                            {:else}
                                <p>Por favor selecciona una sala para comenzar a chatear.</p>
                            {/if}
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
                            <button class="content" >
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
                    <div class="chat-container">
                        <!-- Lista de salas -->
                        <div class="rooms">
                            {#each rooms as room}
                                <button
                                        class="room-button {room === currentRoom ? 'active' : ''}"
                                        on:click={() => joinRoom(room)}
                                >
                                    {room}
                                </button>
                            {/each}
                        </div>

                        <!-- Mensajes de la sala -->
                        <div class="chat">
                            {#if currentRoom}
                                <div class="messages">
                                    {#each messages as { username, message, type }}
                                        <div class="message {type}">
                                            <strong>{username}</strong>: {message}
                                        </div>
                                    {/each}
                                </div>
                                <div class="input">
                                    <input
                                            type="text"
                                            bind:value="{messageInput}"
                                            placeholder="Escribe un mensaje..."
                                    />
                                    <button on:click="{sendMessage}">Enviar</button>
                                </div>
                            {:else}
                                <p>Por favor selecciona una sala para comenzar a chatear.</p>
                            {/if}
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
        .chat-container {
            display: flex;
            height: 100%;
        }

        .rooms {
            width: 25%;
            background-color: #f8f9fa;
            display: flex;
            flex-direction: column;
            padding: 1.5rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .room-button {
            margin: 0.5rem 0;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: bold;
            text-transform: capitalize;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Colores según el tipo de sala */
        .room-button.general {
            background: linear-gradient(45deg, #4caf50, #8bc34a);
            color: white;
        }

        .room-button.admin {
            background: linear-gradient(45deg, #3f51b5, #536dfe);
            color: white;
        }

        .room-button.driver {
            background: linear-gradient(45deg, #ff5722, #ff7043);
            color: white;
        }

        .room-button.support {
            background: linear-gradient(45deg, #009688, #4db6ac);
            color: white;
        }

        /* Hover effect */
        .room-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        /* Active button */
        .room-button.active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border: 2px solid white;
            outline: 2px solid #536dfe;
        }

        .chat {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background-color: #fff;
            padding: 0px 1rem;

        }

        .messages {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 1rem;
            height: 100%;
            overflow-y: auto;
            border: 1px solid #ccc;
            border-radius: 4px;
            background-color: #f9f9f9;
        }


        .message {
            max-width: 60%; /* Limita el ancho de los mensajes */
            padding: 0.5rem 1rem;
            border-radius: 12px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            word-wrap: break-word;
        }

        /* Colores según tipo */
        .message.joined {
            background-color: #d4edda; /* Verde claro */
            color: #155724;
            align-self: center;
        }

        .message.left {
            background-color: #f8d7da; /* Rojo claro */
            color: #721c24;
            align-self: center;
        }

        .message.sent {
            background-color: #cce5ff; /* Azul claro */
            color: #004085;
            align-self: flex-end;
        }

        .message.received {
            background-color: #e2e3e5; /* Gris claro */
            color: #383d41;
            align-self: flex-start;
        }


        .input {
            display: flex;
            padding-top: 10px;
        }

        .input input {
            flex: 1;
            padding: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        .input button {
            margin-left: 0.5rem;
            padding: 0.5rem;
            background-color: #536dfe;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        }
    </style>
</main>
