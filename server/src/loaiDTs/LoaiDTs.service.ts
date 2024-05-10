import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DoiTuong } from 'src/doituongs/DoiTuong.model';
import { SP_GET_DATA_DECRYPT } from 'src/utils/mssql/query';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { LoaiDT } from './LoaiDT.model';

@Injectable()
export class LoaiDTsService {
  constructor(
    @InjectRepository(LoaiDT) private loaiDTRepository: Repository<LoaiDT>
  ) { }

  loaiDTs(utilsParams: UtilsParamsInput): Promise<LoaiDT[]> {
    return this.loaiDTRepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM LoaiDTs 
      SELECT * FROM LoaiDTs WHERE ${utilsParams.condition ? utilsParams.condition : 'MaLoaiDT != 0'
      } 
      ORDER BY MaLoaiDT OFFSET 
      ${utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${utilsParams.take && utilsParams.take > 0
        ? utilsParams.take
        : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async loaiDT(id: number): Promise<LoaiDT> {
    const result = await this.loaiDTRepository.query(
      `SELECT * FROM LoaiDTs WHERE MaLoaiDT = ${id}`,
    );
    return result[0];
  }

  async createLoaiDT(loaiDT: string): Promise<LoaiDT> {
    const result = await this.loaiDTRepository.query(
      `INSERT INTO LoaiDTs VALUES (N'${loaiDT}')
        SELECT * FROM LoaiDTs WHERE MaLoaiDT = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editLoaiDT(loaiDT: string, id: number): Promise<LoaiDT> {
    const result = await this.loaiDTRepository.query(
      `UPDATE LoaiDTs SET LoaiDT = N'${loaiDT}' WHERE MaLoaiDT = ${id}
        SELECT * FROM LoaiDTs WHERE MaLoaiDT = ${id}
      `,
    );
    return result[0];
  }

  async deleteLoaiDT(id: number): Promise<LoaiDT> {
    const result = await this.loaiDTRepository.query(
      `SELECT * FROM LoaiDTs WHERE MaLoaiDT = ${id}
        DELETE FROM LoaiDTs WHERE MaLoaiDT = ${id}
      `,
    );
    return result[0];
  }

  // ResolveField

  DoiTuongs(MaLoaiDT: number): Promise<DoiTuong[]> {
    return this.loaiDTRepository.query(
      SP_GET_DATA_DECRYPT('DoiTuongs', `'MaLoai = ${MaLoaiDT}'`, 0, 0),
    );
  }
}
