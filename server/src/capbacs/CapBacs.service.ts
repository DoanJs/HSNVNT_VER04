import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CBCS } from 'src/cbcss/CBCS.model';
import { SP_GET_DATA_DECRYPT } from 'src/utils/mssql/query';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { CapBac } from './CapBac.model';

@Injectable()
export class CapBacsService {
  constructor(
    @InjectRepository(CapBac) private capbacRepository: Repository<CapBac>,
  ) {}
  capbacs(utilsParams: UtilsParamsInput): Promise<CapBac[]> {
    return this.capbacRepository.query(
      `DECLARE @lengthTable INT
        SELECT @lengthTable = COUNT(*) FROM Capbacs 
        SELECT * FROM CapBacs WHERE ${
          utilsParams.condition ? utilsParams.condition : 'MaCB != 0'
        } 
        ORDER BY MaCB OFFSET 
        ${
          utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
        } ROWS FETCH NEXT 
        ${
          utilsParams.take && utilsParams.take > 0
            ? utilsParams.take
            : '@lengthTable'
        } ROWS ONLY
      `,
    );
  }

  async capbac(id: number): Promise<CapBac> {
    const result = await this.capbacRepository.query(
      `SELECT * FROM CapBacs WHERE MaCB = ${id}`,
    );
    return result[0];
  }

  async createCapBac(capBac: string): Promise<CapBac> {
    const result = await this.capbacRepository.query(
      `INSERT INTO CapBacs VALUES (N'${capBac}')
        SELECT * FROM CapBacs WHERE MaCB = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editCapBac(capBac: string, id: number): Promise<CapBac> {
    const result = await this.capbacRepository.query(
      `UPDATE CapBacs SET CapBac = N'${capBac}' WHERE MaCB = ${id}
        SELECT * FROM CapBacs WHERE MaCB = ${id}
      `,
    );
    return result[0];
  }

  async deleteCapBac(id: number): Promise<CapBac> {
    const result = await this.capbacRepository.query(
      `SELECT * FROM CapBacs WHERE MaCB = ${id}
			  DELETE FROM CapBacs WHERE MaCB = ${id}
      `,
    );
    return result[0];
  }

  // ResolverField
  CBCSs(MaCB: number): Promise<[CBCS]> {
    return this.capbacRepository.query(
      SP_GET_DATA_DECRYPT('CBCSs', `'MaCB = ${MaCB}'`, 0, 0),
    );
  }
}
