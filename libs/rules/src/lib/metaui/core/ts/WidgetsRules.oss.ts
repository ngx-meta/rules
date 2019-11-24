/**
 *  This is generated file. Do not edit !!
 *
 *  @formatter:off
 *
 */
/* tslint:disable */
export const WidgetsRulesRule = '/**  * @license  * Copyright 2017 SAP Ariba  *  * Licensed under the Apache License, Version 2.0 (the "License");  * you may not use this file except in compliance with the License.  * You may obtain a copy of the License at  *  * http://www.apache.org/licenses/LICENSE-2.0  *  * Unless required by applicable law or agreed to in writing, software  * distributed under the License is distributed on an "AS IS" BASIS,  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  * See the License for the specific language governing permissions and  * limitations under the License.  *  * Based on original work: MetaUI: Craig Federighi (2008)  *  */   object { class: ${ meta.toClassName(object)}; } object declare { class: ${ meta.toClassName(object) }; }   /* for search, force explicit class, not one from object (since that"s a hashmap */ operation=search {     class:${values.get("class")}; }  operation=(edit, create, search) {     layout { editing:true; }     class { editing:true; }     field { editing:true; }     action { editing:true; } } operation=(view, list) {     layout { editing:false; }     class { editing:false; }     field { editing:false; }     action { editing:false; } }  field {     visible:$${!properties.get("hidden")};     editing=true  { editable:true; }     editing=false { editable:false; } }  class {     @trait=fiveZones {         zones: zLeft, zMiddle, zRight, zTop, zBottom, zDetail;         fiveZoneLayout:true;     }     @trait=oneZone {         zones: [zLeft, zDetail];     }     @trait=tableZones {         zones: [zMain, zLeft, zRight, zTop, zBottom, zDetail];     }      operation=(create,edit,view,search) {         trait: fiveZones;     }     operation=(list) {         trait: tableZones;     } } @traitGroup=FormZones {     @trait=fiveZones;     @trait=oneZone; }   @traitGroup=FieldType {     @trait=longtext;     @trait=richtext;     @trait=secret; }  @traitGroup=ChooserType {     @trait=Popup;     @trait=PopupControl;     @trait=Chooser; }  @traitGroup=WrapperStyle {     @trait=bold;     @trait=italic;     @trait=heading1;     @trait=heading2;     @trait=heading3; }  action {     visible:$${!properties.get("hidden")};     enabled:true;      @trait=pageAction {         actionResults:${ meta.routingService.routeForPage( properties.get("pageName") ) };     }      @trait=modalComponentPage {         actionResults:${    meta.compPageWithName("MetaModalPage") };         pageBindings:{             componentName:${properties.get("componentName")};             title:${properties.get("title")};         };     }      @trait=modalComponentPanel {         actionResults:${ meta.compPageWithName("MetaModalPage")};         pageBindings:{             componentName:${properties.get("componentName")};             title:${properties.get("title")};             clientPanel:true;         };     }      @trait=instance {     	enabled:${object != null};     	isInstanceAction:true;     }       filterActions=instance {         visible:${properties.get("isInstanceAction") == true};     }     filterActions=static {         visible:${!properties.get("isInstanceAction")};     } }   layout {    zones: [zMain];      @trait=OwnZone {         zonePath:${layout};     }     @trait=pad8 {         wrapperComponent:GenericContainerComponent;         wrapperBindings:{             tagName:div;             style:"padding:8px";          };     } }  @traitGroup=LayoutGrouping {     @trait=Tabs;     @trait=Sections;     @trait=Form;     @trait=Stack; }  class layout=(Inspect, SearchForm) { trait:Form; label:${meta.beautifyClassName(values.class)}; }   layout=InspectWithActions {     trait:Stack;     @layout=Actions#ActionButtons;     @layout=Inspect#Form; }  layout=ButtonArea { trait:StaticActionButtons; } layout=SelectionButtonArea { trait:InstanceActionButtons; } layout=LinksAligned { trait:ActionLinksAligned; } layout=Links  { trait:ActionLinks; }   /* Support @Trait("labelField") to identity label field */ layout=LabelField field {     visible:false;     @trait=labelField { visible:true!; } }  layout=(Table, DetailTable) class {     component:MetaTable;     bindings: {         displayGroup:$displayGroup;         enableScrolling:true;         title:${properties.get("label")};         singleSelect:true;         showSelectionColumn:false;         submitOnSelectionChange:true;     }; }  layout=ListItem class {     component:StringComponent;     bindings:{         value:${properties.get("objectTitle")};     }; } /* layout=DetailTable class {     label:$${UIMeta.defaultLabelForIdentifier(field)}; } */  object class  { objectTitle:${ FieldPath.getFieldValue(object, meta.displayLabel(values.get("class"))) }; } object layout { objectTitle:${ FieldPath.getFieldValue(object, meta.displayLabel(values.get("class"))) }; }    actionCategory {     visible:$${!properties.get("hidden")}; }  @actionCategory=General { after:zMain;  label:$[a001]General; } ';
/* tslint:disable */
/**
 *  @formatter:on
 *
 */
 