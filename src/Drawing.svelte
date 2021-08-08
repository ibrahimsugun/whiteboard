<script>
	import sio from 'socket.io-client'
	import { onDestroy, onMount } from 'svelte'
	let canvas, winWidth, winHeight, ctx, isDrawing = false, thickness = 5, io;
	export let  isInSession;
	onMount(()=>{
		io = sio('http://localhost:5001')
		io.emit('join_room', { name : isInSession.name, owner: isInSession.owner})
		ctx = canvas.getContext('2d')
		

		if(isInSession?.owner) {
			canvas.addEventListener('mousedown', startDraw)
			canvas.addEventListener('mouseup', stopDraw)
			canvas.addEventListener('mousemove', draw)
		
		}

		io.on('session_end', () => {
			alert('oturum kapatıldı')
			isInSession = undefined
		}) 

		io.on('painting', (data) => {
          if(data === true) {

			isDrawing = true
          } else {
			isDrawing = false
			ctx.beginPath()
          }
       })
       io.on('draw', (data) => {
         	const { x, y} = data
           	ctx.lineWidth = thickness
			ctx.lineCap = "round"
			ctx.lineTo(x , y)
			ctx.stroke()
			ctx.beginPath()
			ctx.moveTo(x ,y)
       
       })

	   io.on('eraseScreen', () => {
		 ctx.clearRect(0, 0, canvas.width, canvas.height);
	   })

	   io.on('change_thickness', _thickness => {
		   thickness = _thickness
	   })

	    io.on('change_color', (color) => {
			ctx.strokeStyle = color;
        })
		
	}) 
	
	onDestroy(() => {

			io.disconnect();
	
	
	})
	let colors = [
		"yellow",
		"green",
		"teal",
		"blue",
		"red",
		"black"
	]

	function changeTickness() {
		io.emit('change_thickness', { name: isInSession.name, thickness })
	}
	function ereaseScreen() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		io.emit('eraseScreen', { name : isInSession.name})
	}
	function changeDrawColor(color) {
		ctx.strokeStyle = color;
		io.emit('change_color', { name: isInSession.name, color})
	}
	function startDraw() {
		isDrawing = true
		io.emit('painting',  { name: isInSession.name , isDrawing:  true})
	}
	function stopDraw() {
		isDrawing = false
        ctx.beginPath()
		io.emit('painting',  { name: isInSession.name , isDrawing:  false})
	}
	function draw(e) {
		if(!isDrawing) return false

		ctx.lineWidth = thickness
        ctx.lineCap = "round"
        ctx.lineTo(e.clientX , e.clientY)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(e.clientX, e.clientY)
		io.emit('draw', {name: isInSession.name, x: e.clientX, y: e.clientY})
	}
</script>



{#if isInSession.owner}
<div style="position: fixed; background: lightgray; z-index: 100; padding: 23px; display:flex; gap-6">
	<div>
		<ul>
			{#each colors as color}
				<li on:click={() => changeDrawColor(color)} style="background-color: {color}; width: 30px; height:30px"></li>
			{/each}
		</ul>
		<div> <input on:change={changeTickness} bind:value={thickness} step="1" min="1" max="20" type="range"> </div>
	</div>
	<span on:click={ereaseScreen} style="padding:0; margin:0; margin-left: 20px;"> <i class="fa fa-eraser fa-2x" aria-hidden="true"></i></span>
</div>
{/if}


<svelte:window bind:innerWidth={winWidth} bind:innerHeight={winHeight} />
<div style="z-index: 0; overflow: hidden; width: 100%; height:100% ">
	<canvas bind:this={canvas} width={winWidth} height={winHeight} ></canvas>
</div>


<style>
	ul { 
		padding: 0;
		margin: 0;
		list-style: none;
		display: flex;
		gap: 6px;

		}

	li {
		cursor: pointer;
	}
	input[type=range] {
		width: 100%;
	}



</style>
<svelte:head><title>{isInSession.name} oturumu</title> </svelte:head>