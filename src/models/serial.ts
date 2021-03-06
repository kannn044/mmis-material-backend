import Knex = require('knex');
import * as moment from 'moment';

export class SerialModel {
  getSerialInfo(knex: Knex, srType: string) {
    return knex('sys_serials as sr')
      .where('sr.sr_type', srType)
      .select('sr.sr_no', 'sr.is_year_prefix', 'sr.sr_prefix', 'sr.digit_length', 'sf.serial_code')
      .leftJoin('sys_serial_format as sf', 'sf.serial_format_id', 'sr.serial_format_id')
      .limit(1);
  }

  async getSerial(knex: Knex, srType: any) {

    let serialInfo = await this.getSerialInfo(knex, srType);
    if (serialInfo.length) {
      let currentNo = serialInfo[0].sr_no;
      let serialCode = serialInfo[0].serial_code;
      let serialLength = serialInfo[0].digit_length;
      let serialPrefix = serialInfo[0].sr_prefix;
      let serialYear = moment().get('year') + 543;
      let _serialYear = serialYear.toString().substring(2);
      let newSerialNo = this.paddingNumber(currentNo, serialLength);

      let sr: any = null;

      if (serialInfo[0].is_year_prefix === 'Y') {
        sr = serialCode.replace('PREFIX', serialPrefix).replace('YY', _serialYear).replace('##', newSerialNo);
      } else {
        sr = serialCode.replace('PREFIX', serialPrefix).replace('##', newSerialNo);
      }
      // update serial
      await this.updateSerial(knex, srType);
      // return serial
      return sr;

    } else {
      return '000000';
    }
  }

  paddingNumber(n: number, p: number) {
    var pad_char = '0';
    var pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
  }

  async updateSerial(knex: Knex, srType: string) {
    return knex('sys_serials')
      .increment('sr_no', 1)
      .where('sr_type', srType);
  }

  // ##############################################
  async getSerialGenerics(knex: Knex, typeId: any) {

    let serialInfo = await this.getSerialGenericInfo(knex, typeId);
    if (serialInfo.length) {
      let prefixNo = serialInfo[0].prefix_no;
      let prefixName = serialInfo[0].prefix_name;
      let newSerialNo = this.paddingNumber(prefixNo, 6);

      let sr = prefixName + newSerialNo;

      // update serial
      await this.updateSerialGeneric(knex, typeId);
      // return serial
      return sr;

    } else {
      return '000000';
    }
  }

  async updateSerialGeneric(knex: Knex, typeId: string) {
    return knex('mm_generic_types')
      .increment('prefix_no', 1)
      .where('generic_type_id', typeId);
  }

  getSerialGenericInfo(knex: Knex, typeId: any) {
    return knex('mm_generic_types as gt')
      .where('gt.generic_type_id', typeId)
      .limit(1);
  }

}