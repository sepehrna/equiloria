import {Entity} from "./Entity";
import {v4 as generateUuid} from "uuid";
import {Activity} from "./Activity";

export class Bill implements Entity {

    private _billId: string
    private _billName: string
    private _billDate: Date
    private _insertTime: Date
    private _activity: Activity | null

    constructor() {
        this._billId = generateUuid()
        this._billName = ''
        this._billDate = new Date()
        this._insertTime = new Date()
        this._activity = null
    }


    get billId(): string {
        return this._billId;
    }

    get billName(): string {
        return this._billName;
    }

    get billDate(): Date {
        return this._billDate;
    }

    get insertTime(): Date {
        return this._insertTime;
    }

    set activity(value: Activity | null) {
        this._activity = value;
    }

    set billName(value: string) {
        this._billName = value
    }

    set billDate(value: Date) {
        this._billDate = value
    }
}

export class BillBuilder {
    private readonly bill: Bill

    constructor() {
        this.bill = new Bill()
    }

    billName(billName: string): BillBuilder {
        this.bill.billName = billName
        return this
    }

    billDate(billDate: Date): BillBuilder {
        this.bill.billDate = billDate
        return this
    }

    activity(activity: Activity): BillBuilder {
        this.bill.activity = activity
        return this
    }

    build(): Bill {
        return this.bill
    }
}