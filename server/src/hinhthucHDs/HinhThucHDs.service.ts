import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeNghiTSNT } from 'src/denghiTSNTs/DeNghiTSNT.model';
import { SP_GET_DATA_DECRYPT } from 'src/utils/mssql/query';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { HinhThucHD } from './HinhThucHD.model';

@Injectable()
export class HinhThucHDsService {
  constructor(
    @InjectRepository(HinhThucHD)
    private hinhthucHDRepository: Repository<HinhThucHD>,
  ) {}

  hinhthucHDs(utilsParams: UtilsParamsInput): Promise<HinhThucHD[]> {
    return this.hinhthucHDRepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM HinhThucHDs 
      SELECT * FROM HinhThucHDs WHERE ${
        utilsParams.condition ? utilsParams.condition : 'MaHTHD != 0'
      } 
      ORDER BY MaHTHD OFFSET 
      ${
        utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${
        utilsParams.take && utilsParams.take > 0
          ? utilsParams.take
          : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async hinhthucHD(id: number): Promise<HinhThucHD> {
    const result = await this.hinhthucHDRepository.query(
      `SELECT * FROM HinhThucHDs WHERE MaHTHD = ${id}`,
    );
    return result[0];
  }

  async createHinhThucHD(hinhthuc: string): Promise<HinhThucHD> {
    const result = await this.hinhthucHDRepository.query(
      `INSERT INTO HinhThucHDs VALUES (N'${hinhthuc}')
        SELECT * FROM HinhThucHDs WHERE MaHTHD = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editHinhThucHD(hinhthuc: string, id: number): Promise<HinhThucHD> {
    const result = await this.hinhthucHDRepository.query(
      `UPDATE HinhThucHDs SET HinhThuc = N'${hinhthuc}' WHERE MaHTHD = ${id}
        SELECT * FROM HinhThucHDs WHERE MaHTHD = ${id}
      `,
    );
    return result[0];
  }

  async deleteHinhThucHD(id: number): Promise<HinhThucHD> {
    const result = await this.hinhthucHDRepository.query(
      `SELECT * FROM HinhThucHDs WHERE MaHTHD = ${id}
        DELETE FROM HinhThucHDs WHERE MaHTHD = ${id}
      `,
    );
    return result[0];
  }

  // ResolveField




  
  DeNghiTSNTs(MaHTHD: number): Promise<DeNghiTSNT[]> {
    return this.hinhthucHDRepository.query(
      SP_GET_DATA_DECRYPT('DeNghiTSNTs', `'MaHTHD =  ${MaHTHD}'`, 0, 0),
    );
  }
}
