/**
 *  This is generated file. Do not edit !!
 *
 *  @formatter:off
 *
 */
/* tslint:disable */
export const InvoiceRule = 'class=Invoice {   field=uniqueName {     label: "Id";   }   field=name {     label: "Title";     trait: required;     placeholder: "Unique name that identifies this Invoice";   }   field=requestor {     trait:asAutoComplete, withDetail;     placeholder: "Select a user";     lookupKey: "fullName";   }    field=purchaseOrder {     trait:asSelect;     choices: ["PO1111", "PO2222", "PO33333", "P33333", "PO3333", "PO44444", "PO55555"];   }    field=supplier {     trait:asAutoComplete, withDetail;     placeholder: "Select a supplier";   }    field=paymentTerms {     trait:asSelect, required;     choices:${controller.paymentTermsDS};   }    field=totalAmount {     label: "Price to Pay";   }    field=billingAddress {     trait:asAutoComplete, inlineObject;     label: "Bill To";    }    field=shippingAddress {     trait:asAutoComplete;     label: "Ship To";      operation=view {       component:AddressComponent;       bindings: {         address:$value;       };     }   }    field=description {     trait:longtext;     label: "Purpose";   }    field=isShared {     label: "Share";   }    field=shareContact {     label:"Share To";     visible:${object.isShared === true};   }    field=accountCategory {     trait:asRadio;     choices: ["Asset", "Order", "Cost Center", "Project"];   } }  class=Invoice {    operation=(edit, create) {         zNone => *;         zLeft   =>  name#fluid => requestor =>    needBy           => accountCategory => shippingAddress => billingAddress;         zRight  => totalAmount => supplier => paymentTerms => taxInvoiceNumber => purchaseOrder => isShared => shareContact;         zBottom => description;      }      operation=view {         zNone => *;         zLeft   =>  name  => requestor =>    needBy           => accountCategory => shippingAddress => billingAddress;         zRight  => uniqueName => totalAmount => supplier => paymentTerms => taxInvoiceNumber => purchaseOrder => isShared => shareContact;         zBottom => description;    } }   class=Invoice object {   action=(reset, save) {       trait:controllerAction;       visible:${properties.get("editing") === true};   }     action=edit {       trait:controllerAction;       visible:${properties.get("editing") === false};   }    action=(edit, save) {     buttonOptions:"emphasized";   } }  ';
/* tslint:disable */
/**
 *  @formatter:on
 *
 */
 