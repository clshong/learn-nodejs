import http from 'http'

const PROT = 8000

const server = http.createServer((req, res) => {
 res.writeHead(200,{ 
    'Content-Type': 'application/json'
 })  
 res.end(JSON.stringify({message: 'Hello World'}))
})

server.listen(PROT, () => {
    console.log(`http://localhost:${PROT}/`)
})