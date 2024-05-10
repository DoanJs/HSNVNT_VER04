import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CBCS } from 'src/cbcss/CBCS.model';
import { SP_GET_DATA_DECRYPT } from 'src/utils/mssql/query';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { ChucVu } from './ChucVu.model';

@Injectable()
export class ChucVusService {
  constructor(
    @InjectRepository(ChucVu) private chucVuRepository: Repository<ChucVu>,
  ) { }

  chucVus(utilsParams: UtilsParamsInput): Promise<ChucVu[]> {
    return this.chucVuRepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM ChucVus 
      SELECT * FROM ChucVus WHERE ${utilsParams.condition ? utilsParams.condition : 'MaCV!=0'
      } 
      ORDER BY MaCV OFFSET 
      ${utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${utilsParams.take && utilsParams.take > 0
        ? utilsParams.take
        : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async chucVu(id: number): Promise<ChucVu> {
    const result = await this.chucVuRepository.query(
      `SELECT * FROM ChucVus WHERE MaCV = ${id}`,
    );
    return result[0];
  }

  async createChucVu(chucVu: string): Promise<ChucVu> {
    const result = await this.chucVuRepository.query(
      `INSERT INTO ChucVus VALUES (N'${chucVu}')
        SELECT * FROM ChucVus WHERE MaCV = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editChucVu(chucVu: string, id: number): Promise<ChucVu> {
    const result = await this.chucVuRepository.query(
      `UPDATE ChucVus SET ChucVu = N'${chucVu}' WHERE MaCV = ${id}
        SELECT * FROM ChucVus WHERE MaCV = ${id}
      `,
    );
    return result[0];
  }

  async deleteChucVu(id: number): Promise<ChucVu> {
    const result = await this.chucVuRepository.query(
      `SELECT * FROM ChucVus WHERE MaCV = ${id}
			  DELETE FROM ChucVus WHERE MaCV = ${id}
      `,
    );
    return result[0];
  }

  // ResolveField

  CBCSs(MaCV: number): Promise<CBCS[]> {
    return this.chucVuRepository.query(
      SP_GET_DATA_DECRYPT('CBCSs', `'MaCV = ${MaCV}'`, 0, 0),
    );
  }
}
