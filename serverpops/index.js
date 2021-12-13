const fastify = require('fastify')({ 
    logger: false
})

fastify.register(require('fastify-mysql'), {
  connectionString: 'mysql://root:superuser@localhost:3306/pops'
})

fastify.register(require('fastify-cors'), {
  origin: [
    'http://localhost:1234'   // Development
  ]
})



fastify.get('/api/:method', async (request, reply) => {
    await fastify.mysql.getConnection(onConnect)

    function onConnect (err, client) {
        if (err) return reply.send(err)

        let methods = request.params.method

        if (methods === 'Test') {
            client.query(
                `SELECT 1`, 
                
                    function onResult (err, result) {
                        client.release()
                        reply.header('Content-Type', 'application/json; charset=utf-8')
                        reply.send(err || 'Connection is OK')
                    }
                )
        } else if (methods === 'CheckConnectionPOPS') {
            client.query(
                `SELECT 1 AS result`, 
                
                    function onResult (err, result) {
                        client.release()
                        reply.header('Content-Type', 'application/json; charset=utf-8')
                        reply.send(err || result)
                    }
                )
        }
    }
})



fastify.get('/api/:method/:data', async (request, reply) => {
    await fastify.mysql.getConnection(onConnect)

    function onConnect (err, client) {
        if (err) return reply.send(err)

        let methods = request.params.method

        if (methods === 'CheckPaid') {
            client.query(
              `SELECT AFNum AS result FROM orderpaydetail WHERE OPRefId = ?`, 
              [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result === null ? true : false)
                }
              )
        }
    }
})




// Run the server!
const start = async () => {
  try {
    await fastify.listen(1236)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
    console.log(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    console.error(err)
    process.exit(1)
  }
}
start()
