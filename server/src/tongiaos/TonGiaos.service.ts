import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CBCS } from 'src/cbcss/CBCS.model';
import { DoiTuong } from 'src/doituongs/DoiTuong.model';
import { SP_GET_DATA_DECRYPT } from 'src/utils/mssql/query';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { TonGiao } from './TonGiao.model';

@Injectable()
export class TonGiaosService {
  constructor(
    @InjectRepository(TonGiao) private tongiaoRepository: Repository<TonGiao>,
  ) { }
  tonGiaos(utilsParams: UtilsParamsInput): Promise<TonGiao[]> {
    return this.tongiaoRepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM TonGiaos 
      SELECT * FROM TonGiaos WHERE ${utilsParams.condition ? utilsParams.condition : 'MaTG != 0'
      } 
      ORDER BY MaTG OFFSET 
      ${utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${utilsParams.take && utilsParams.take > 0
        ? utilsParams.take
        : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async tonGiao(id: number): Promise<TonGiao> {
    const result = await this.tongiaoRepository.query(
      `SELECT * FROM TonGiaos WHERE MaTG = ${id}`,
    );
    return result[0];
  }

  async createTonGiao(tenTG: string): Promise<TonGiao> {
    const result = await this.tongiaoRepository.query(
      `INSERT INTO TonGiaos VALUES (N'${tenTG}')
        SELECT * FROM TonGiaos WHERE MaTG = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editTonGiao(tenTG: string, id: number): Promise<TonGiao> {
    const result = await this.tongiaoRepository.query(
      `UPDATE TonGiaos SET TenTG = N'${tenTG}' WHERE MaTG = ${id}
        SELECT * FROM TonGiaos WHERE MaTG = ${id}
      `,
    );
    return result[0];
  }

  async deleteTonGiao(id: number): Promise<TonGiao> {
    const result = await this.tongiaoRepository.query(
      `SELECT * FROM TonGiaos WHERE MaTG = ${id}
        DELETE FROM TonGiaos WHERE MaTG = ${id}
      `,
    );
    return result[0];
  }

  // ResolveField

  DoiTuongs(MaTG: number): Promise<DoiTuong[]> {
    return this.tongiaoRepository.query(
      SP_GET_DATA_DECRYPT('DoiTuongs', `'MaTG = ${MaTG}'`, 0, 0),
    );
  }

  CBCSs(MaTG: number): Promise<CBCS[]> {
    return this.tongiaoRepository.query(
      SP_GET_DATA_DECRYPT('CBCSs', `'MaTG = ${MaTG}'`, 0, 0),
    );
  }
}
