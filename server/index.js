const fastify = require('fastify')({ 
    logger: false
})

fastify.register(require('fastify-mysql'), {
  connectionString: 'mysql://root:superuser@localhost:3306/iips'
})

fastify.register(require('fastify-cors'), {
  origin: [
    '*'   // Development
  ]
})


fastify.get('/api/:method', async (request, reply) => {
    await fastify.mysql.getConnection(onConnect)

    function onConnect (err, client) {
        if (err) return reply.send(err)

        let methods = request.params.method

        if (methods === 'Test') {

            client.query(
            `SELECT employeename FROM employee WHERE uname = 'TEST'`, 
            
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || 'Connection is OK')
                }
            )
        } else if (methods === 'CheckConnection') {

            client.query(
            `SELECT 1 AS result`, 
            
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'GetExcavation') {
            client.query(
                `SELECT ref_bldgcomputationsheetid AS result FROM ref_bldgcomputationsheet WHERE accountdescription = 'EXCAVATION FEE'`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'GetPool') {

            client.query(
                `SELECT ref_bldgcomputationsheetid AS result FROM ref_bldgcomputationsheet WHERE accountdescription = 'POOL FEE'`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'GetEmbankment') {

            client.query(
                `select ref_bldgcomputationsheetid AS result from ref_bldgcomputationsheet where accountdescription = 'EMBANKMENT FEE'`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'GetOtherAccountCode') {

            client.query(
                `SELECT accountcode AS resultA, old_accountcode AS resultO FROM ref_bldgcomputationsheet WHERE accountdescription = 'OTHER FEES'`,
                [request.params.data],
                
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

        if (methods === 'CheckExisting') {

            client.query(
                `SELECT receivingid AS result FROM receiving WHERE applicationNo = ?`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'CheckNameError') {

            client.query(
                `SELECT occlastName AS result FROM customer WHERE customerid = (SELECT customerid FROM receiving WHERE applicationNo = ?)`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'CheckAdminFine') {

            client.query(
                `SELECT COUNT(building_orderofpaymentid) AS result FROM building_orderofpayment WHERE bldgApplicationNo = ? AND ref_bldgcomputationsheetid = 14 AND popstransmitted = 0 AND is_paid = 0`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'GetAdminFine') {

            client.query(
                `SELECT DISTINCT amount AS result FROM building_orderofpayment WHERE bldgApplicationNo = ? AND ref_bldgcomputationsheetid = 14`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'CheckArea') {

            client.query(
                `SELECT totalArea AS resultT, bldgFeeid AS resultI, bldgFee AS resultF FROM bldg_fee WHERE bldgApplicationNo = ?`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'CheckFence') {

            client.query(
                `SELECT tagFencePermit AS result FROM receiving_permits WHERE receivingid = ?`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'CheckLastStatus') {

            client.query(
                `SELECT tagword AS result FROM docflowtxn WHERE docflowtxnid = (SELECT MAX(docflowtxnid) from docflowtxn WHERE receivingid = ?)`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'GetOPOtherDetails') {

            client.query(
                `SELECT DISTINCT assessedby_id AS resultA, reviewedby_id AS resultR, optn AS resultO FROM building_orderofpayment WHERE bldgApplicationNo = ? AND popstransmitted = 0 AND is_paid  = 0 AND is_delete = 0 AND is_tag = 0`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'CheckUsername') {

            client.query(
                `SELECT COUNT(employeeid) AS result FROM employee WHERE uname = ?`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'CheckPassword') {

            client.query(
                `SELECT password AS result FROM employee WHERE uname = ?`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'GetEmployeeID') {

            client.query(
                `SELECT employeeid AS result FROM employee WHERE uname = ?`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'GetAccess') {

            client.query(
                `SELECT ref_accessid AS result FROM access WHERE employeeid = ? AND formAccess = 1 AND is_delete = 0 ORDER BY ref_accessid ASC`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'GetNewDescription') {

            client.query(
                `SELECT ref_bldgcomputationsheetid AS result FROM ref_bldgcomputationsheet WHERE accountdescription = ?`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'CheckNewFee') {

            client.query(
                `SELECT COUNT(ref_bldgcomputationsheetid) AS result FROM ref_bldgcomputationsheet WHERE accountdescription = ?`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'GetNewFee') {

            client.query(
                `SELECT COUNT(ref_bldgcomputationsheetid) AS result FROM ref_bldgcomputationsheet WHERE accountdescription = ?`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } 
    }
})





fastify.get('/api/:method/:data/:data2', async (request, reply) => {
    await fastify.mysql.getConnection(onConnect)

    function onConnect (err, client) {
        if (err) return reply.send(err)

        let methods = request.params.method

        if (methods === 'CheckExistOP') {

            client.query(
                `SELECT COUNT(building_orderofpaymentid) AS result FROM building_orderofpayment WHERE bldgApplicationNo = ? AND ref_bldgcomputationsheetid = ?`,
                [request.params.data, request.params.data2],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        }
    }
})




fastify.put('/api/:method/:data', async (request, reply) => {
    await fastify.mysql.getConnection(onConnect)

    function onConnect (err, client) {
        if (err) return reply.send(err)

        let methods = request.params.method

        if (methods === 'FixNameError') {

            client.query(
                `UPDATE customer SET occlastName = '', occfirstName = '', occmiddleInitial = '' WHERE customerid = (SELECT customerid FROM receiving WHERE applicationNo = ?)`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'FixFencePayment') {

            client.query(
                `UPDATE building_orderofpayment SET is_approve = 0, for_approval = 1 WHERE bldgApplicationNo = ? AND popstransmitted = 0 AND is_paid = 0 AND is_delete = 0`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'UpdateOrderofPaymentForReRelease') {

            client.query(
                `UPDATE building_orderofpayment SET popstransmitted = 0 WHERE bldgApplicationNo = ? AND is_approve = 1 AND for_approval = 1 AND is_paid = 0 AND is_delete = 0`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        }
    }
})



fastify.post('/api/:method', async (request, reply) => {
    await fastify.mysql.getConnection(onConnect)

    function onConnect (err, client) {
        if (err) return reply.send(err)

        let methods = request.params.method

        if (methods === 'FixFenceDocflow') {

            client.query(
                `INSERT INTO docflowtxn (docflowtxnid, receivingid, datetransac, employeeid, ref_designationid, remarks, is_tag, tagword, editEmployee, is_approve, is_compliance, is_delete)
                VALUES (NULL, ?, NOW(), 1, NULL, 'FOR ORDER OF PAYMENT APPROVAL', '03', 'RECOMMENDING', NULL, 0, 0, 0)`,
                [request.body.id],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'AddNewAdminFine') {

            client.query(
                `INSERT INTO building_orderofpayment (building_orderofpaymentid, bldgApplicationNo, occupancyid, ref_bldgcomputationsheetid, amount, is_issued, assessedby_id, reviewedby_id, orNo, datePaid, is_tag, is_approve, for_approval, popstransmitted, is_paid, is_delete, collector, comment, amt_Gflgu, amt_Gfdpwh, amt_Tfbo, numUnits, opDate, optn, securitycode, barcode)
                VALUES (NULL, ?, 0, 14, ?, 0, ?, ?, NULL, NULL, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?, NULL, NULL)`,
                [request.body.app, request.body.amount, request.body.assess, request.body.review, request.body.optn],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'SaveOP') {

            client.query(
                `INSERT INTO building_orderofpayment (building_orderofpaymentid, bldgApplicationNo, occupancyid, ref_bldgcomputationsheetid, amount, is_issued, assessedby_id, reviewedby_id, orNo, datePaid, is_tag, is_approve, for_approval, popstransmitted, is_paid, is_delete, collector, comment, amt_Gflgu, amt_Gfdpwh, amt_Tfbo, numUnits, opDate, optn, securitycode, barcode)
                VALUES (NULL, ?, 0, ?, ?, 0, ?, ?, NULL, NULL, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?, NULL, NULL)`,
                [request.body.app, request.body.ref, request.body.amount, request.body.assess, request.body.review, request.body.optn],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'SaveNewFee') {

            client.query(
                `INSERT INTO ref_bldgcomputationsheet (ref_bldgcomputationsheetid, accountdescription, accountcode, is_tag, form, ref_permitnameid, is_delete, old_accountcode)
                VALUES (NULL, ?, ?, 0, NULL, 1, 0, ?)`,
                [request.body.description, request.body.code, request.body.oldcode],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'PushToAssessment') {

            client.query(
                `INSERT INTO docflowtxn (docflowtxnid, receivingid, datetransac, employeeid, ref_designationid, remarks, is_tag, tagword, editEmployee, is_approve, is_compliance, is_delete)
                VALUES (NULL, ?, NOW(), ?, NULL, 'FOR ASSESSMENT', '02', 'ASSESSMENT', NULL, 0, 0, 0)`,
                [request.body.id, request.body.employeeid],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'PushToReleasing') {

            client.query(
                `INSERT INTO docflowtxn (docflowtxnid, receivingid, datetransac, employeeid, ref_designationid, remarks, is_tag, tagword, editEmployee, is_approve, is_compliance, is_delete)
                VALUES (NULL, ?, NOW(), ?, NULL, 'ORDER OF PAYMENT PRINTED', '11', 'OPPRINTED', NULL, 0, 0, 0)`,
                [request.body.id, request.body.employeeid],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        }
    }
})




fastify.delete('/api/:method/:data', async (request, reply) => {
    await fastify.mysql.getConnection(onConnect)

    function onConnect (err, client) {
        if (err) return reply.send(err)

        let methods = request.params.method

        if (methods === 'RemoveAdminFines') {

            client.query(
                `DELETE FROM building_orderofpayment WHERE bldgApplicationNo = ? and ref_bldgcomputationsheetid = 14 AND is_paid = 0 AND popstransmitted = 0 AND is_delete = 0`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } else if (methods === 'DeleteOrderofPayment') {

            client.query(
                `DELETE FROM building_orderofpayment WHERE bldgApplicationNo = ? AND (orNo IS NULL OR orNo = 0) AND is_paid = 0 AND is_delete = 0`,
                [request.params.data],
                
                function onResult (err, result) {
                    client.release()
                    reply.header('Content-Type', 'application/json; charset=utf-8')
                    reply.send(err || result)
                }
            )
        } 
    }
})


    //Duplicate Admin Fine
    //1.Count Admin Fine
    //2.Delete Duplicates

    //Duplicate Area
    //1.Count Areas
    //2.Delete Duplicates on bldg_fee
    //3.Update Floor Area on bldg_permit

    //Cannot Locate OP Approval (Fence)
    //1.Check if Fence
    //2.Check Last Status
    //3.Add OP Approval if not latest
    //4.Make sure for_approval = 1 and is_approved = 0

    //Excavation
    //1.Get Excavation details from ref_bldgcomputation
    //2.Ask Amount to Add
    //3.Save Amount on building_orderofpayment
    //4.Push to Approval if already approved

    //Pool
    //1.Get Pool details from ref_bldgcomputation
    //2.Ask Amount to Add
    //3.Save Amount on building_orderofpayment
    //4.Push to Approval if already approved

    //Embankment
    //1.Get Embankment details from ref_bldgcomputation
    //2.Ask Amount to Add
    //3.Save Amount on building_orderofpayment
    //4.Push to Approval if already approved



// Run the server!
const start = async () => {
  try {
    await fastify.listen(1235)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
    console.log(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    console.error(err)
    process.exit(1)
  }
}
start()
