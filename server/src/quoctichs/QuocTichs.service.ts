import { Injectable } from '@nestjs/common';
import { QuocTich } from './QuocTich.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { DoiTuong } from 'src/doituongs/DoiTuong.model';
import { SP_GET_DATA_DECRYPT } from 'src/utils/mssql/query';
import { CBCS } from 'src/cbcss/CBCS.model';
import { DanToc } from 'src/dantocs/DanToc.model';

@Injectable()
export class QuocTichsService {
  constructor(
    @InjectRepository(QuocTich)
    private quoctichRepository: Repository<QuocTich>,
  ) { }
  quocTichs(utilsParams: UtilsParamsInput): Promise<QuocTich[]> {
    return this.quoctichRepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM QuocTichs 
      SELECT * FROM QuocTichs WHERE ${utilsParams.condition ? utilsParams.condition : 'MaQT != 0'
      } 
      ORDER BY MaQT OFFSET 
      ${utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${utilsParams.take && utilsParams.take > 0
        ? utilsParams.take
        : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async quocTich(id: number): Promise<QuocTich> {
    const result = await this.quoctichRepository.query(
      `SELECT * FROM QuocTichs WHERE MaQT = ${id}`,
    );
    return result[0];
  }

  async createQuocTich(tenQT: string): Promise<QuocTich> {
    const result = await this.quoctichRepository.query(
      `INSERT INTO QuocTichs VALUES (N'${tenQT}')
        SELECT * FROM QuocTichs WHERE MaQT = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editQuocTich(tenQT: string, id: number): Promise<QuocTich> {
    const result = await this.quoctichRepository.query(
      `UPDATE QuocTichs SET TenQT = N'${tenQT}' WHERE MaQT = ${id}
        SELECT * FROM QuocTichs WHERE MaQT = ${id}
      `,
    );
    return result[0];
  }

  async deleteQuocTich(id: number): Promise<QuocTich> {
    const result = await this.quoctichRepository.query(
      `SELECT * FROM QuocTichs WHERE MaQT = ${id}
        DELETE FROM QuocTichs WHERE MaQT = ${id}
      `,
    );
    return result[0];
  }

  // ResolveField

  async DanTocs(MaQT: number): Promise<DanToc[]> {
    return await this.quoctichRepository.query(
      `SELECT * FROM DanTocs WHERE MaQT = ${MaQT}`,
    )
  }

  DoiTuongs(MaQT: any): Promise<DoiTuong[]> {
    return this.quoctichRepository.query(
      SP_GET_DATA_DECRYPT('DoiTuongs', `'MaQT = ${MaQT}'`, 0, 0),
    );
  }

  CBCSs(MaQT: any): Promise<CBCS[]> {
    return this.quoctichRepository.query(
      SP_GET_DATA_DECRYPT('CBCSs', `'MaQT = ${MaQT}'`, 0, 0),
    );
  }
}
