/**
 *  This is generated file. Do not edit !!
 *
 *  @formatter:off
 *
 */
/* tslint:disable */
export const UserRule = 'class=User {     field=uniqueName{         label:"User Id";     }      zNone => *;     zLeft => uniqueName => firstName => lastName => age => dob; }    layout=Inspect2#Stack {     @layout=MenuTop#ActionButtons {     }      @layout=First#Form {     } }   object @action=update  {      actionResults:${ object.firstName = "Mr." +  object.firstName };      visible: ${ properties.editing; }; }   object @action=Save  {      label: "My Save";      actionResults:${ object.firstName = "Ms." +  object.firstName };      visible: ${ properties.editing; };      buttonStyle:info; }    group=ObjectDetail class=User {     layout {             trait:labelsOnTop;     }      field=uniqueName {         label:"User Id";     }      zNone => *;     zLeft => uniqueName => firstName => lastName; } ';
/* tslint:disable */
/**
 *  @formatter:on
 *
 */
 