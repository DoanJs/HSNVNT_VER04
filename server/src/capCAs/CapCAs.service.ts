import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CATTPvaTD } from 'src/caTTPvaTD/CATTPvaTD.model';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { CapCA } from './CapCA.model';

@Injectable()
export class CapCAsService {
  constructor(
    @InjectRepository(CapCA) private capCARepository: Repository<CapCA>,
  ) { }

  capCAs(utilsParams: UtilsParamsInput): Promise<CapCA[]> {
    return this.capCARepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM CapCAs 
      SELECT * FROM CapCAs WHERE ${utilsParams.condition ? utilsParams.condition : 'MaCapCA!=0'
      } 
      ORDER BY MaCapCA OFFSET 
      ${utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${utilsParams.take && utilsParams.take > 0
        ? utilsParams.take
        : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async capCA(id: number): Promise<CapCA> {
    const result = await this.capCARepository.query(
      `SELECT * FROM CapCAs WHERE MaCapCA = ${id}`,
    );
    return result[0];
  }

  async createCapCA(capCA: string): Promise<CapCA> {
    const result = await this.capCARepository.query(
      `INSERT INTO CapCAs VALUES (N'${capCA}')
        SELECT * FROM CapCAs WHERE MaCapCA = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editCapCA(capCA: string, id: number): Promise<CapCA> {
    const result = await this.capCARepository.query(
      `UPDATE CapCAs SET CapCA = N'${capCA}' WHERE MaCapCA = ${id}
        SELECT * FROM CapCAs WHERE MaCapCA = ${id}
      `,
    );
    return result[0];
  }

  async deleteCapCA(id: number): Promise<CapCA> {
    const result = await this.capCARepository.query(
      `SELECT * FROM CapCAs WHERE MaCapCA = ${id}
			  DELETE FROM CapCAs WHERE MaCapCA = ${id}
      `,
    );
    return result[0];
  }

  // ResolveField
  async CATTPvaTDs(MaCapCA: number): Promise<CATTPvaTD[]> {
    return await this.capCARepository.query(
      `SELECT * FROM CATTPvaTDs WHERE MaCapCA = ${MaCapCA}`,
    );
  }
}
