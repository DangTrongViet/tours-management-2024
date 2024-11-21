import { Request, Response } from "express";
import Tour from "../../models/tour.model";
import Customer from "../../models/customer.model";
import Booking from "../../models/bookings.model";



export const index = async (req: Request, res: Response) => {

    res.render("client/pages/cart/index", {
        pageTitle: "Giỏ hàng",

    });
}


export const checkout = async (req: Request, res: Response) => {
    let cart = [];
    const data = {
        cart: {},
        customer: {},

    }

    if (req.body.cart) {
        cart = req.body.cart;
    }

    if (req.body.customer) {
        const { fullName, phone, email, note } = req.body.customer;


        const existCustomer = await Customer.findOne({
            raw: true,
            attributes: ['id', 'fullName', 'email', 'phone', 'note'],
            where: {
                email: email,
                deleted: false,
                status: 'active'
            }
        });



        if (!existCustomer) {
            const newCustomer = await Customer.create({
                fullName,
                phone,
                email,
                note

            });
            const customer = await Customer.findOne({
                raw: true,
                attributes: ['id', 'fullName', 'email', 'phone', 'note'],
                where: {
                    email: newCustomer["email"],
                    status: "active",
                    deleted: false
                }
            })
            data.customer = customer;
        }
        else {
            data.customer = existCustomer;
        }

    }

    let tourDetail = [];

    for (const item of cart) {
        const tourId = item.tourId;

        const tour = await Tour.findOne({
            raw: true,
            where: {
                id: tourId,
                deleted: false,
                status: "active"
            }
        });
        let total_price = item.quantity * (tour["price"] * (1 - tour["discount"] / 100));
        tour["quantity"] = item.quantity;
        if (data.customer["id"]) {
            await Booking.create({
                customerId: data.customer["id"],
                tourId: tourId,
                quantity: item.quantity,
                total_price: total_price,
                note: data.customer["note"]

            })
        }
        tourDetail.push(tour);
    }
    data.cart = tourDetail;



    res.json({
        code: 200,
        message: "Thành công",
        data: data
    });


}

