require('dotenv').config({ path: '../.env' })
const { Order } = require('../models')
const { OrderContractJSON, ItemContractJSON, web3 } = require('./infura.controller')

const updateOrder = async (req, res) => {
    const OrderContract = await new web3.eth.Contract(OrderContractJSON.abi, req.body._id)
    const orderState = await OrderContract.methods.state().call()
    const orderDealine = await OrderContract.methods.getDeadline().call()
    Order
        .findByIdAndUpdate(req.body._id, {
            state: orderState,
            deadline: orderDealine
        })
        .exec(err => err ? res.status(500).json(err) : res.status(201).json({ state: orderState, deadline: orderDealine }))
        .catch(error => res.status(404).json(error))
}

const changePrice = async (req, res) => {
    const ItemContract = await new web3.eth.Contract(
        ItemContractJSON.abi,
        req.body._id
    )
    const ItemPrice = await ItemContract.methods.price().call()
    Item
        .findByIdAndUpdate(req.body._id, { price: ItemPrice })
        .exec(err => err ? res.status(500).json(err) : res.status(201).json(ItemPrice))
}

const delivery = (req, res) => {
    Order
        .findById(req.body.id)
        .select('nowIn')
        .then(orderNowIn => {
            if (orderNowIn.nowIn === 'Nowhere') {
                Order
                    .findByIdAndUpdate(req.body.id, {
                        from: req.body.nowIn,
                        nowIn: req.body.nowIn
                    })
                    .exec(err =>
                        err ? res.status(500).json(err) : Order.findById(req.body.id).select('nowIn from to').then(order => res.status(201).json(order))
                    )
            } else {
                Order
                    .findByIdAndUpdate(req.body.id, {
                        nowIn: req.body.nowIn,
                    })
                    .exec(err =>
                        err ? res.status(500).json(err) : Order.findById(req.body.id).select('nowIn from to').then(order => res.status(201).json(order))
                    )
            }
        })
}

const setDeliveryTo = async (req, res) => {
    Order
        .findByIdAndUpdate(req.body.id, {
            to: req.body.to,
        })
        .exec(err =>
            err ? res.status(500).json(err) : Order.findById(req.body.id).select('nowIn from to').then(order => res.status(201).json(order))
        )
}


module.exports = {
    getPurchaseOrder,
    getSalesOrder,
    updateOrder,
    changePrice,
    delivery,
    setDeliveryTo
}