<script>
    import sio from 'socket.io-client'
    import { onDestroy, onMount } from 'svelte'
    export let isInSession
    let io, _name, _password, _private = false, isPaswordRequired , password = ""
    let list =  []
    onMount(()=>{
        io = sio('http://localhost:5001')

        io.on('create_room', (data) => {
            list = data
        })
        io.on('room_already_exist', () => {
            alert('belirtilen adda oda mevcut')
        })

        io.on('join', (data) => {
            isInSession =  data
        })
    })

    onDestroy(() => {
        io.disconnect();
    })
    
    function createRoom() {

        if(_private) {
            io.emit('create_room', { name : _name , password: _password})
        } else   io.emit('create_room', { name : _name})
    }


    function joinRoom(room) {
       
        if(room.private) {
           isPaswordRequired = room
        } else {
            io.emit('join', { name : room.name, owner : false})
        }
        
    }

    function inputPassword() {
        io.emit('join_with_password', { name : isPaswordRequired.name, owner : false, password})

        io.on('password_invalid', () => {
            alert('Hatalı şifre')
        })
    }
</script>



<style>
    #container {
        display: flex;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        justify-content: center;
        align-items: center;
    }
    #session-list {
        background-color: dimgray;
        width: 200px;
        height: 100%;
        overflow-y: scroll;
    }
    ul {
        display: flex;
        flex-direction: column;
        gap: 12px;
        list-style: none;
        width: 100%;
        padding: 0;
        margin: 0;
    }

    li {
        margin: 4px 22px;
        background: gray;
        padding: 12px;
    }

    li span {
        float: right;
        background: #313131;
        padding: 3px;
        color: #cecece;
    }

    #container-inner {
        width: 800px;
        height: 600px;
        padding: 22px;
        background-color: #313131;
        display: flex;
    }
    #form-div {
        width: 100%;
        height: 100%;
        background: #313131;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap : 12px
    }

    form input {
        padding: 8px
    }

    button {
        width: 100%;
    }
    label {
        width: 100%;
        background: 313131;
        color: aliceblue
    }

    #password-modal {
        position: fixed;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(11,11,11,.99);
        color: aliceblue;
    }
    #password-modal-inner {

        display: flex;
        flex-direction: column;
        padding: 20px;
        width: 260px;
        height: 230px;
        background-color: #1e1e1e;
    }
    #password-modal-inner span {
        padding: 4px;
        background: black;
        cursor:pointer;
    }
     /* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
} 
</style>



{#if isPaswordRequired}

<div id="password-modal">
    <form on:submit|preventDefault={inputPassword} id="password-modal-inner">
        <span on:click={() => isPaswordRequired = undefined}> X </span>
        <h2>Bu odaya katılabilmek için şifre gereklidir</h2>
        <input bind:value={password} type="password" placeholder="şifre">
        <button type="submit">Katıl</button>
    </form>
</div>

{/if}


<div id="container" >
    <div id="container-inner">
        <div id="session-list">
            <ul >
                {#each list as item}
                    <li>{item.name} <span
                        on:click={() => joinRoom(item)}
                        >Katıl</span></li>
                {/each}
            </ul>
        </div>
        <div id="form-div"> 
            <form on:submit|preventDefault={createRoom}>
                <input bind:value={_name} placeholder="Oda adı" type="text" required>
                <label>
                    <input bind:checked={_private} type="checkbox">
                    Özel oda oluştur
                </label>
                {#if _private}
                <input  bind:value={_password} placeholder="şifre"  type="password">
                {/if}
                <button type="submit">Oda oluştur</button>
            </form>
        </div>
    </div> 
</div>

<svelte:head><title>giriş kayıt</title> </svelte:head>