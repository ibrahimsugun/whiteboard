const sio = require('socket.io')


// oturumlar adı ve şifresi
let rooms = []


// http://localhost:5001
const io = sio(5001, {
    cors: { origin : "*"}
})

// socket bağlandığında

io.on('connection', (socket) => {
    // socket bağlandığında odaların listesini yolla
    socket.emit('create_room', rooms.map(x => {
        /*
            anlam karmaşası

            create_room eventi alındıgında odayı yaratıp diğer bütün clientlere aynı 
            event ile oda listesi yollanıyor

        */
    if(x.password) {
        return {
            private : true,
            name: x.name
        }
    }

    return {
        private : false,
        name : x.name
    }
}))
     // oda yarat
   socket.on('create_room', ( data ) => {
    const { name, password } = data
        
        if(rooms.find(x => x.name == name)) return socket.emit('room_already_exist')

        password ? rooms.push({name, password}) : rooms.push({name})
        socket.broadcast.emit('create_room', rooms.map(x => {

            if(x.password) {
                return {
                    private : true,
                    name: x.name
                }
            }

            return {
                private : false,
                name : x.name
            }
        }))
        socket.emit('join', { owner: true, name})


      
    
    })

    socket.on('join', room => {
        const _room = rooms.find(x => x.name == room.name)
        if(!_room) return socket.emit('Oda bulunamadı') 
   
        socket.emit('join', room )
    })
    socket.on('join_with_password', room => {
        const _room = rooms.find(x => x.name == room.name && x.password == room.password)
        if(!_room) return socket.emit('password_invalid') 
   
        socket.emit('join', room )
    })
    
    socket.on('join_room', room => {
        const _room = rooms.find(x => x.name == room.name)
        if(room.owner) {
           socket.name = room.name
        }
        socket.join(_room.name)
         
    }) 
    


    socket.on("disconnect", () => {
         if(socket.name) {
            rooms = rooms.filter(x => x.name !== socket.name)

            socket.broadcast.to(socket.name).emit('session_end')
         }
         socket.broadcast.emit('create_room', rooms.map(x => {

            if(x.password) {
                return {
                    private : true,
                    name: x.name
                }
            }

            return {
                private : false,
                name : x.name
            }
        }))
         
      });
      socket.on('draw', (data) => {
            const { name  } = data
            socket.broadcast.to(name).emit('draw', data)
            
        })
        socket.on('painting', (data) => {
            const { name, isDrawing } = data

            socket.broadcast.to(name).emit('painting', isDrawing)
            
        })

        socket.on('eraseScreen', ({ name }) => {
            socket.broadcast.to(name).emit('eraseScreen')
        })

        socket.on('change_thickness', ({ name , thickness}) => {
            socket.broadcast.to(name).emit('change_thickness', thickness)
        })

        socket.on('change_color', ({ name , color}) => {
            socket.broadcast.to(name).emit('change_color', color)
        })
})