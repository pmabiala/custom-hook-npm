import React, { Component } from "react";
// react plugin that creates an input with badges
import {common_params ,cTimeStamp, wScrollTo, randomize, getCurrentUser, getCookies} from "../Common/Common.js"
import Blob from "components/Blob/Blob";
import Multiselect from 'multiselect-react-dropdown';
import {saveDataTierToDatasync} from '../DataSyncLib/DataSyncLib.jsx'
import "./DynamicFormComponent.css"

// reactstrap components
import {
  Button,
  Label,
  FormGroup,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col,
} from "reactstrap";
import { Redirect } from "react-router-dom";


class DynamicFormComponent extends Component {
  constructor (props){
    super(props);

    if (common_params.parameters.debugging){
      console.log("30:DynamicForm3Tiers2::this.props.data_blob",this.props.data_blob)
      console.log("30DynamicForm3Tiers::this.props.form",this.props.form)
    }

    this.state = {form:{}}
    //this.data_blob = {data_tier:{}}
    //2DO debug this.data_tier = (this.props.data_blob && this.props.data_blob.data_tier)?this.props.data_blob.data_tier:{}
    this.data_blob = (this.props.data_blob && this.props.data_blob.data_tier)?this.props.data_blob:{data_tier:{}}
  }
  
  componentDidMount = () => {
    //Component initialization in edit mode
    if (this.props.form) {
      this.clearForm();
    }
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.form !== prevProps.form) {
        //Lookup field props has changed
        if (common_params.parameters.debugging)
          console.log("09/07:componentDidUpdate -> props.form:has changed", this.props.form)
        this.clearForm()
    }

    if (this.props.data_blob !== prevProps.data_blob) {
        //Lookup field props has changed
        if (common_params.parameters.debugging)
          console.log("09/07:componentDidUpdate -> props.data_blob.data_tier:has changed", this.props.data_blob.data_tier)
        this.clearForm()
    }
  }

  clearForm = () => {
    /** Duplicate props.form */
    let clearObject2 = JSON.parse(JSON.stringify(this.props.form));

    /** set data_tier with (props.foreign_keys + props.data_tier) */
    if (this.props.data_blob){
      //Set internal data_tier component property
      //OBSOLETE this.data_tier = this.props.data_blob.data_tier
      if (common_params.parameters.debugging) console.log("01:this.props.data_blob ->", this.props.data_blob)
      clearObject2.data_tier = this.props.data_blob.data_tier
    }
    else{
      if (common_params.parameters.debugging) console.log("01:this.props.data_blob.data_tier unDefined")
      clearObject2.data_tier = {} //Set empty data_tier
    }

    /** Override data with foreign keys wne props.foreign_key is available */
    if (this.props.foreign_keys){
      clearObject2.data_tier = Object.assign(clearObject2.data_tier, this.props.foreign_keys)//Dead code to be checked !!!
      this.data_blob.data_tier = Object.assign(clearObject2.data_tier, this.props.foreign_keys)//Dead code to be checked !!!
    }
    

    if (common_params.parameters.debugging){
      console.log("01:----- clearForm -----")
      console.log("01:clearForm::this.props.form->",this.props.form)
      console.log("01:clearForm::clearObject2 mixed with data_tier ->",clearObject2)
      console.log("01:clearForm::internal this.data_blob ->",this.data_blob)
    }

    this.setState({fieldError:[],form:{},captcha1:randomize(0,5), captcha2:randomize(0,5)}, //Clear forced
      ()=>{
        if (common_params.parameters.debugging) console.log("09/07:DynamicForm3Tiers2 state cleansed 2:", this.state)
            this.setState({fieldError:[],form:clearObject2})
          });
  }

  getFieldData = (pFieldObject) => {
    /** Return data value form field object */
    let nextFieldData = this.data_blob.data_tier[pFieldObject.name]?this.data_blob.data_tier[pFieldObject.name]:"";

    if (common_params.parameters.debugging)
      console.log("01:getFieldData[", pFieldObject.name ,"] nextFieldData->", nextFieldData)
    return nextFieldData
  }

  setFieldData = (pFieldObject, value) => {
    this.data_blob.data_tier[pFieldObject.name] =  value

    if (common_params.parameters.debugging)
    console.log("01:setFieldData[", pFieldObject.name ,"] value->", value)
    console.log("01:setFieldData[", pFieldObject.name ,"] this.data_blob.data_tier ->", this.data_blob.data_tier)
    console.log("01:setFieldData[", pFieldObject.name ,"] this.data_blob ->", this.data_blob)
  }

  getSelectedFieldValues_V1 = (pFieldObject) => {
    return pFieldObject.selected_values?pFieldObject.selected_values:"";
  }
  
  setFieldError = (pFieldObject, value) => {
    try{
      pFieldObject.err = value;
      let nextFieldError = this.state.fieldError;
      nextFieldError[pFieldObject.name] = value
      this.setState({ fieldError : nextFieldError})
      //Scroll form to first erroneous field
      wScrollTo(pFieldObject.name)
    }
    catch(e){
      console.log(`Error caught on ${e}`)
    }
  }

  getFieldError = (pFieldObject) => {
    /** Return data value form field object */
    try {
      return pFieldObject.err?pFieldObject.err:"";
    }
    catch(e){
      return("")
    }
  }

  _error_label = field => {
    return(
      <label className="dynamic-form-error">
            {this.getfieldErrorLabel(field)} 
      </label>
    )
  }

  getfieldErrorLabel = (pFieldObject) => {
    return this.getFieldError(pFieldObject)
  }

  getFieldLabelTitle = (pFieldObject) => {
    return(
      <h6 id={pFieldObject.name}>
        {pFieldObject.title?pFieldObject.title:pFieldObject.placeholder}
        {(pFieldObject.required && !this.props.read_only) && <span className="icon-danger">*</span>}
      </h6>
    )
  }

  getCaptchaFieldLabelTitle = (pFieldObject) => {
    return(
      <h6 id={pFieldObject.name}>
        {`${this.state.captcha1} + ${this.state.captcha2}`}
        {pFieldObject.required && <span className="icon-danger">*</span>}
      </h6>
    )
  }

  getFieldData_V1 = (pFieldObject) => {
    return(
      pFieldObject.value?pFieldObject.value:(pFieldObject.default_value?pFieldObject.default_value:"")
    )
  }

  getFieldPrompt = (pFieldObject) => {
    return(
        pFieldObject.placeholder?pFieldObject.placeholder:pFieldObject.title
    )
  }

  _numeric_field_with_add_on = (field,fa_symbol) => {
    return(
      <>
        {this.getFieldLabelTitle(field)}
        <InputGroup className="border-input">
          <Input
            readOnly={this.props.read_only?this.props.read_only:false} 
            type={field.input_type} 
            value={this.getFieldData(field)} 
            placeholder={field.placeholder}
            autocomplete="on"
            id={field.name}
            name={field.name}
            onChange={(e)=>{
                  e.preventDefault();
                  this.dynamicInputNumericChangeHandler({event:e, fieldObject:field})}}
            />

          {/** Euro symbol */}

          {fa_symbol && 
          <InputGroupAddon addonType="append">            
            <InputGroupText>
              <i className={`fa ${fa_symbol}`}/>
            </InputGroupText>
          </InputGroupAddon>}
          
        </InputGroup>
        {this._error_label(field)}
      </>
    )
  }

  _captcha_field = (field,fa_symbol) => {
    return(
      <>
        {this.getCaptchaFieldLabelTitle(field)}
        <InputGroup className="border-input">
          <Input
            readOnly={this.props.read_only?this.props.read_only:false} 
            type={field.input_type} 
            value={this.getFieldData(field)} 
            placeholder={field.placeholder}
            autocomplete="on"
            id={field.name}
            name={field.name}
            onChange={(e)=>{
                  e.preventDefault();
                  this.dynamicInputNumericChangeHandler({event:e, fieldObject:field})}}
            />
        </InputGroup>
        {this._error_label(field)}
      </>
    )
  }

  _text_field = field => {
    return(
      <div>
        {this.getFieldLabelTitle(field)}
        <Input
          readOnly={this.props.read_only?this.props.read_only:false}  
          type={field.input_type}
          value={this.getFieldData(field)} 
          placeholder={field.placeholder}
          autocomplete="off"
          onChange={(e)=>{
                e.preventDefault();
                this.dynamicInputTextChangeHandler({event:e, fieldObject:field})}}
          />
          {this._error_label(field)}
      </div>)
  }

  _email_field = field => {
    return(
      <div>
        {this.getFieldLabelTitle(field)}
        <Input
          readOnly={this.props.read_only?this.props.read_only:false}  
          type={field.input_type}
          value={this.getFieldData(field)} 
          placeholder={field.placeholder}
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
          autocomplete="on"
          id={field.name}
          name={field.name}
          onChange={(e)=>{
                e.preventDefault();
                this.dynamicInputTextChangeHandler({event:e, fieldObject:field})}}
          />
          {this._error_label(field)}
      </div>)
  }

  _memo_field = field => {
    return(
      <div>
        {this.getFieldLabelTitle(field)}
        <textarea
          className="form-control"
          readOnly={this.props.read_only?this.props.read_only:false} 
          type={field.input_type}
          value={this.getFieldData(field)} 
          placeholder={field.placeholder}
          rows={field.rows}
          onChange={(e)=>{
                e.preventDefault();
                this.dynamicInputTextChangeHandler({event:e, fieldObject:field})}}
          />
          {this._error_label(field)}
      </div>)
  }

  _combo_field = field => {
    return(
      <div>
        {this.getFieldLabelTitle(field)}    
          <Multiselect
              showArrow
              options={field.combo_list}
              isObject={false}
              displayValue="key"
              selectedValues={this.getFieldData(field)?this.getFieldData(field).split(";"):[]}
              placeholder= {field.placeholder}
              emptyRecordMsg = ""
              onSelect = {(selectedList, selectedItem) => {this.setFieldData(field, selectedList.join(";"));}}
              onRemove = {(selectedList, selectedItem) => {this.setFieldData(field, selectedList.join(";"));}}
              disable = {this.props.read_only}
              singleSelect = {true}
              />
          {this._error_label(field)}
      </div>)
  }

  _multi_field = field => {
    return(
      <div>
        {this.getFieldLabelTitle(field)}    
          <Multiselect
              showArrow
              options={field.combo_list}
              isObject={false}
              displayValue="key"
              selectedValues={this.getFieldData(field)?this.getFieldData(field).split(";"):[]}
              placeholder= {field.placeholder}
              emptyRecordMsg = ""
              onSelect = {(selectedList, selectedItem) => {this.setFieldData(field, selectedList.join(";")); }}
              onRemove = {(selectedList, selectedItem) => {this.setFieldData(field, selectedList.join(";")); }}
              disable = {this.props.read_only}
              singleSelect = {false}
              />
          {this._error_label(field)}
      </div>)
  }

  saveFormToDatasyncProcess = () => {
    //Everything sounds ok in Form, Go ahead
    let hasDataGuid = (this.props.datasync_object && this.props.datasync_object.data_guid)
    saveDataTierToDatasync (
      hasDataGuid?this.props.datasync_object.data_guid:null, //data_guid
      this.data_blob, //p_o_data_blob,
      this.props.company_guid,//p_s_company_guid,
      this.props.table_guid,//p_s_table_guid,
      hasDataGuid?this.props.datasync_object.createstamp:cTimeStamp(), //p_dt_createstamp,
      hasDataGuid?cTimeStamp():null,//p_dt_updatestamp,
      null,//p_dt_deletestamp,
      this.onFormSavedLocalHandler,
      this.onFormUpdatedLocalHandler,
      this.onFormFailedLocalHandler,
      null)
  }

  /** Form Handlers */
  onClickSubmitFormHandler  = async event => {
    if (event)
      event.preventDefault();

    //Force all fields check    
    let canSubmit = true

    let iRow = 0;
    while(
      (iRow < this.state.form.Rows.length)
      && (canSubmit)){
      let iCol = 0;
      while ((iCol < this.state.form.Rows[iRow].Cols.length) && canSubmit){
        let ii=0
        while(
          (ii < this.state.form.Rows[iRow].Cols[iCol].Fields.length)
          && (canSubmit &= this.checkValidation(this.state.form.Rows[iRow].Cols[iCol].Fields[ii]))){

          if (common_params.parameters.debugging)
            console.log(`Fields[${ii}]|${this.state.form.Rows[iRow].Cols[iCol].Fields[ii].name}| canSubmit=${canSubmit}`)
          
            ii++;
        }
        iCol++
      }
      iRow++;
    } 
          
    if (common_params.parameters.debugging)
        console.log("canSubmit:", canSubmit)

    if (!canSubmit) {
      let err_message = "Le formulaire comporte des erreurs !"
      if (this.props.onFormFailed)
        this.props.onFormFailed(err_message)
      else 
        alert(`${err_message}`)
      return false;
    }
   
    //Invoke onFormSubmit props
   
    if (this.props.onFormSubmit){
      if (common_params.parameters.debugging)
        alert("onFormSubmit => filter log with AsyncDebug:: prefixe")
      //If props function return false then cancel form submit and do not save !
      this.props.onFormSubmit(this.data_blob,this.saveFormToDatasyncProcess)
    }
    else {
      //Call save anyway
      this.saveFormToDatasyncProcess()
    }



    //this.saveFormToDatasync_OLD((this.props.datasync_object && this.props.datasync_object.data_guid)?this.props.datasync_object.data_guid:null);
  }

  onFormSavedLocalHandler = (blob) => {
    if (this.props.onFormSaved) 
      this.props.onFormSaved(blob)
    else 
      console.error("DynamicForm3Tiers2.onFormSaved props is not defined !")
    //clear form
    if (this.props.clearOnSave) this.clearForm()
    //Call onTerminated if set by user
    if (this.props.onTerminated) this.props.onTerminated()
  }

  onFormUpdatedLocalHandler = (blob) => {
    if (this.props.onFormUpdated) 
      this.props.onFormUpdated(blob)
    else 
      console.error("DynamicForm3Tiers2.onFormUpdated props is not defined !")
    //clear form
    if (this.props.clearOnUpdate) this.clearForm()
    //Call onTerminated if set by user
    if (this.props.onTerminated) this.props.onTerminated()
  }

  onFormFailedLocalHandler = (err) => {
    if (this.props.onFormFailed) 
      this.props.onFormFailed(err)
    else {
      console.error("DynamicForm3Tiers2.onFormFailed props is not defined !")
      alert("Erreur de sauvegarde !!!")
    }    
  }

  checkValidation = (pFieldObject) => {
    let fieldName = pFieldObject.name;

    /** Get field properties */
    let min = pFieldObject.min_length
    let max = pFieldObject.max_length
    let fieldValue = this.getFieldData(pFieldObject);
    console.log("d3t3:checkValidation fieldValue->", fieldValue)
    let errorsFieldName = `err_${fieldName}` /** Error data displayed in dedicated error label, beside input field in Form */
    let nextErrors = [];

    if (common_params.parameters.debugging)
      console.log(`d3t:min:${min} - max:${max}`)

    /** Check basic field validity except combo and radio */
    if ((pFieldObject.required) && (fieldValue.trim().length <= 0))
      nextErrors.push(`obligatoire`)
  
    if ((min > 0) && (pFieldObject.required) && (fieldValue.trim().length < min))
        nextErrors.push(`trop court.`)

    //Captcha check
    if (pFieldObject.input_type.toLowerCase() == "captcha"){
      if (parseInt(fieldValue) !== (this.state.captcha1 + this.state.captcha2))
                    nextErrors.push(`calcul faux !`)
    }

    //Email check
    if (pFieldObject.input_type.toLowerCase() == "email"){
      if (!fieldValue.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i))
                    nextErrors.push(`Format de mail incorrect !`)
    }

    if ((max > 0) && (fieldValue.trim().length > max))
        nextErrors.push(`trop long, ${fieldValue.trim().length - max} caractères en trop.`)
    /* Special validation handlers
    if (parseInt(this.state[fieldName]) !== (this.state.v1 + this.state.v2))
        nextErrors.push(`calcul faux !`)*/

    if (common_params.parameters.debugging){
        console.log(`d3t:-----------------`)
        console.log(`d3t:fieldName => ${fieldName}`)
        console.log(`d3t:value => ${fieldValue}`)

        console.log(`errorsFieldName => ${errorsFieldName}`)
        console.log(`nextErrors => ${nextErrors}`)
        console.log(`nextErrors.length => ${nextErrors.length}`)
    }

    //update error field
      if (common_params.parameters.debugging){
        console.log("nextFieldsErrorsArray=>",nextErrors)
      }

      this.setFieldError(pFieldObject, nextErrors.join("/"))

      if (common_params.parameters.debugging){
        console.log(`new fieldError : ${this.getFieldError(pFieldObject)}`)
      }    

    //set change flag
    //nextState.has_changed = true

    //Return validation predicate
    return (nextErrors.length === 0) //returns true if no error occurs
  }

  dynamicInputTextChangeHandler = (eventObject) => {
      if (eventObject && eventObject.event)
          eventObject.event.preventDefault();
      if (common_params.parameters.debugging)
          console.log(`d3t:dynamicInputTextChangeHandler eventObject -> `,eventObject)
      
      this.setFieldData(eventObject.fieldObject, eventObject.event.target.value)
      
      //Validate field
      this.checkValidation(eventObject.fieldObject)
  }

  dynamicInputNumericChangeHandler = (eventObject) => {
      if (eventObject && eventObject.event)
          eventObject.event.preventDefault();
      if (common_params.parameters.debugging)
          console.log(`d3t:dynamicInputNumericChangeHandler ${eventObject.fieldObject.name} Input field has changed`)
      
      if (
          eventObject.event.target.value.length == 0 ||
          !isNaN(eventObject.event.target.value) && 
          !isNaN(parseFloat(eventObject.event.target.value))) 
        this.setFieldData(eventObject.fieldObject, eventObject.event.target.value)
      else{
        if (common_params.parameters.debugging)
          console.log(`d3t:Value rejected -> ${eventObject.event.target.value}`)
      }

      //Validate field
      if (common_params.parameters.debugging)
        console.log(`#${eventObject.fieldObject.name} => ${this.getFieldData(eventObject.fieldObject)}`)

      this.checkValidation(eventObject.fieldObject)
  }

  _colRendering = col => {
    try{
    return(
      <Col>
      {
        col.Fields.map(
          (field,ii)=>{
            return this._fieldRendering(field, ii)
          }
        )
      }
      </Col>
    )}
    catch(err){
      return(<Col>Error {err.message}</Col>)
    }
  }

  _rowRendering = row => {
    try{
     return(
      <Row>
      {
      row.Cols.map(
        (col,ii)=>{
          return(this._colRendering(col))
        })
      }
      </Row>
     )}
     catch(err){
      return(<Col>Error {err.message}</Col>)
    }
  }

  migrate_field = (pFieldObject, migrated_value) => {
    //Set data_tier property with former form value
    this.data_blob.data_tier[pFieldObject.name] = migrated_value;
    if (common_params.parameters.debugging) console.log("09/07:migrate_field -> pFieldObject.name=", pFieldObject.name)
  }

  data_tier_migration = (field, ii) => {
    if (!this.props.data_blob) return;//Discard migration 
    return
    //data_tier_migration disbled
    console.log("09/07:data_tier_migration ### Migration check  !!!")
    console.log("09/07:this.data_blob.modified ->", (this.data_blob && this.data_blob.modified)?this.data_blob.modified:"null")
    //Check if migration required
    if ((this.data_blob && this.data_blob.modified) && (this.data_blob.modified < globals.parameters.form_modified_version))
      if (common_params.parameters.debugging)
        console.log("09/07:field needs migration from version 1 to version 2")
    else{
      if (common_params.parameters.debugging)
        console.log("09/07:Field is up to date")
      //Don't care migration process
      return
    }

    if (common_params.parameters.debugging){
      console.log("09/07:data_tier_migration ->", field.input_type)
    }

    switch (field.input_type.toLowerCase()){
      /** Dynamic fields */
      case "checkbox-DISABLED" :
      case "checkbox" :
      case "blob":
      case "email":
      case "text":
      case "memo":
      case "multi":
      case "numeric":
      case "amount":
      case "percent":
      case "captcha":
      case "textarea":
        //Migrate single field
        if (common_params.parameters.debugging){
          console.log("09/07:data_tier_migration single field ->", field.name)
        }
        this.migrate_field(field, this.getFieldData_V1(field))
        break;

      case "combo":
      case "radio":
        //Migrate selected field
        if (common_params.parameters.debugging){
          console.log("09/07:data_tier_migration selected field ->", field.name)
        }
        this.migrate_field(field, this.getSelectedFieldValues_V1(field))
        break;
    
      default:
          alert("data_tier_migration --> Field type not supported ->" + field.input_type)
    }
}

  _fieldRendering = (field, ii) => {
    console.log("09/07:_fieldRendering -> data_tier_migration call")
    this.data_tier_migration(field, ii)
    //Do not display field if empty in read only mode
    if (this.props.read_only &&
        ((this.getFieldData(field) == null) || (!this.getFieldData(field)) || (this.getFieldData(field).trim().length == 0)))
    return (<></>)

    //Do not display hidden field
    if (field.hidden && !this.props.show_hidden)
      return (<></>)

    switch (field.input_type.toLowerCase()){
      /** Dynamic fields */
      case "checkbox-DISABLED" :
        return(
          <FormGroup check>
            {/*-- set anchor ID here --*/}
            <Label check>
              <Input defaultValue="" type="checkbox" readOnly={this.props.read_only?this.props.read_only:false}/>
              {field.placeholder}
              <span className="form-check-sign" />
            </Label>
          </FormGroup>
        );

      case "checkbox" :
          /* Checkbox is override with combobox */
        return(
          <div>
            {this.getFieldLabelTitle(field)}    
              <Multiselect
                  showArrow
                  options={["Oui","Non"]}
                  isObject={false}
                  displayValue="key"
                  selectedValues={this.getFieldData(field)?this.getFieldData(field).split(";"):[]}
                  placeholder= {field.placeholder}
                  emptyRecordMsg = ""
                  onSelect = {(selectedList, selectedItem) => {this.setFieldData(field, selectedList.join(";")); }}
                  onRemove = {(selectedList, selectedItem) => {this.setFieldData(field, selectedList.join(";")); }}
                  disable = {this.props.read_only}
                  singleSelect = {true}
                  />
              {this._error_label(field)}
          </div>)
              
      case "blob":
        return(
          <>
              {this.getFieldLabelTitle(field)}
              {/*
              <label className="col-md-12 col-form-label">{`${this.getFieldPrompt(field)}:`}</label>
              */}
              <div className="col-md-10">
                  <Blob
                      readOnly={this.props.read_only?this.props.read_only:false}
                      Caption={`${this.getFieldPrompt(field)} ...`} 
                      data={this.getFieldData(field)} 
                      uploadPicture={(UploadFile) => {this.setFieldData(field,UploadFile.data); this.checkValidation(field)}} 
                      pictureStyle="pic"
                      buttonStyle = {"btn btn-secondary"}/>

                  {/* Sticky error label */}
                  {this._error_label(field)}
              </div>
          </>
        )

      case "email":
        return this._email_field(field);

      case "text":
        return this._text_field(field);

      case "memo":
        return this._memo_field(field);

      case "combo":
      case "radio":
        return this._combo_field(field);

      case "multi":
        return this._multi_field(field);

      case "numeric":
        return this._numeric_field_with_add_on(field,"*");

      case "amount":
        return this._numeric_field_with_add_on(field,"fa-euro");

      case "percent":
        return this._numeric_field_with_add_on(field,"%");
      
      case "captcha":
        return this._captcha_field(field);

      default:
          console.log("alert à Malibu");
    }
  }

  _cancelButton = () => {
    let buttonIsHidden = (this.props.read_only || (this.props.buttons_options && this.props.buttons_options.cancel_button_hidden))
    let buttonCaption = (this.props.buttons_options && this.props.buttons_options.cancel_button_caption)?this.props.buttons_options.cancel_button_caption:"Annuler"
    if (buttonIsHidden) return(<></>)
    else{

          return(
                  <Col md="4" sm="4">
                    <Button
                      block
                      className="btn-round"
                      color="danger"
                      outline
                      type="reset"
                      onClick = {()=>{this.clearForm()}}
                    >{buttonCaption}</Button>
                  </Col>)
      }
  }

  _submitButton = () => {
    let buttonIsHidden = (this.props.read_only || (this.props.buttons_options && this.props.buttons_options.submit_button_hidden))
    let buttonCaption = (this.props.buttons_options && this.props.buttons_options.submit_button_caption)?this.props.buttons_options.submit_button_caption:"Soumettre"
    if (buttonIsHidden) return(<></>)
    else{

          return(
                  <Col md="4" sm="4">
                    <Button
                      block
                      className="btn-round"
                      color="danger"
                      outline
                      type="submit"
                      onClick = {()=>{this.onClickSubmitFormHandler()}}
                    >{buttonCaption}</Button>
                  </Col>)
      }
  }

  render = () => {
    return (
      <>
              {!this.state.form &&
              <div>
                <h1>Form loading...</h1>
              </div>}

              <form>
                {
                  this.state.form &&
                  this.state.form.Rows &&
                  this.state.form.Rows.map(
                    row => {
                      return(
                        this._rowRendering(row)
                      )
                    })
                }
              </form>
              <Row className="buttons-row">
                  {this._cancelButton()}

                  {this._submitButton()}
                  
                  {this.props.custom_button_caption &&
                  <Col md="4" sm="4">
                    <Button
                      block
                      className="btn-round"
                      color="primary"
                      type="submit"
                      onClick = {(e) => {if (this.props.custom_button_handler) this.props.custom_button_handler(this.state.form); else console.error("custom_button_handler unset !")}}
                    >
                      {this.props.custom_button_caption}
                    </Button>
                  </Col>}

                  {this.props.custom_button_caption2 &&
                  <Col md="4" sm="4">
                    <Button
                      block
                      className="btn-round"
                      color="primary"
                      type="submit"
                      onClick = {(e) => {if (this.props.custom_button_handler2) this.props.custom_button_handler2(this.state.form); else console.error("custom_button_handler2 unset !")}}
                    >
                      {this.props.custom_button_caption2}
                    </Button>
                  </Col>}
                </Row>
      </>
    );
  }
}
export default DynamicFormComponent;
