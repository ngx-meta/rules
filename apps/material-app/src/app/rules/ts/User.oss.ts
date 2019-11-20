/**
 *  This is generated file. Do not edit !!
 *
 *  @formatter:off
 *
 */
/* tslint:disable */
export const UserRule = '/*     User rules.oss -- Meta-data rules. Generated file      Default definition */ class=User {     field=title {       after:zTop;       trait:bold;     }      field=(uniqueName , firstName , prefAirline , favAnimal , toppings) {       after: zLeft;     }      field=(lastName , favColor , birthDate , isChecked) {           after: zRight;     }      field=uniqueName {       label: "SSN #";     }      /* field=uniqueName {       label: "Id";       hint: "This is generated field.";     }*/      field=(firstName, lastName) {       trait:required;     }      field=prefAirline {         label:"My airlines";         trait:required,asSelect;         choices:${controller.airlines};     }      field=favColor {         trait:asSelect;         choices:["Blue", "Red", "Yellow"];     }      field=favAnimal {        label: "My Animal";        hint: ${"Animal says: " + value.sound};        trait:asAutoComplete,required;        choices:${controller.animals};     }      field=isChecked {       label: "Do I live in cave?";     }      field=toppings {        label:"Preferred toppings";        choices:["Extra cheese", "Mushroom", "Onion", "Pepperoni", "Sausage", "Tomato"];     }      field=description {       after:zBottom;       hint: ${"You can type some long text here: " + value.length};     } }    /**   .User .prefAirline {      trait:toOneRelationship;   }  */ class=User field=prefAirline {    trait:toOneRelationship; }             ';
/* tslint:disable */
/**
 *  @formatter:on
 *
 */
 