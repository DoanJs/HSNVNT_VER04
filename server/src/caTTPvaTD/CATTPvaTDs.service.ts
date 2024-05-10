import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeNghiTSNT } from 'src/denghiTSNTs/DeNghiTSNT.model';
import { QuyetDinhTSNT } from 'src/quyetdinhTSNTs/QuyetDinhTSNT.model';
import { SP_GET_DATA_DECRYPT } from 'src/utils/mssql/query';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { CATTPvaTD } from './CATTPvaTD.model';
import { CATTPvaTDInput } from './type/CATTPvaTD.input';
import { CapCA } from 'src/capCAs/CapCA.model';
import { DataLoaderService } from 'src/dataloader/Dataloader.service';
import { CAQHvaTD } from 'src/caQHvaTD/CAQHvaTD.model';

@Injectable()
export class CATTPvaTDsService {
  constructor(
    @InjectRepository(CATTPvaTD)
    private caTTPvaTDRepository: Repository<CATTPvaTD>,
    private readonly dataloaderService: DataLoaderService,
  ) { }

  public readonly caTTPvaTD_DataInput = (
    caTTPvaTDInput: CATTPvaTDInput,
  ) => {
    return {
      CATTPvaTD: caTTPvaTDInput.CATTPvaTD ? `N'${caTTPvaTDInput.CATTPvaTD}'` : null,
      MaCapCA: caTTPvaTDInput.MaCapCA ? caTTPvaTDInput.MaCapCA : null,
    };
  };

  caTTPvaTDs(utilsParams: UtilsParamsInput): Promise<CATTPvaTD[]> {
    return this.caTTPvaTDRepository.query(
      `DECLARE @lengthTable INT
        SELECT @lengthTable = COUNT(*) FROM CATTPvaTDs 
        SELECT * FROM CATTPvaTDs WHERE ${utilsParams.condition ? utilsParams.condition : 'MaCATTPvaTD != 0'
      } 
        ORDER BY MaCATTPvaTD OFFSET 
        ${utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
        ${utilsParams.take && utilsParams.take > 0
        ? utilsParams.take
        : '@lengthTable'
      } ROWS ONLY
      `,
    );
  }

  async caTTPvaTD(id: number): Promise<CATTPvaTD> {
    const result = await this.caTTPvaTDRepository.query(
      `SELECT * FROM CATTPvaTDs WHERE MaCATTPvaTD = ${id}`,
    );
    return result[0];
  }

  async createCATTPvaTD(caTTPvaTDInput: CATTPvaTDInput): Promise<CATTPvaTD> {
    const result = await this.caTTPvaTDRepository.query(
      `INSERT INTO CATTPvaTDs VALUES (${this.caTTPvaTD_DataInput(caTTPvaTDInput).CATTPvaTD}, ${this.caTTPvaTD_DataInput(caTTPvaTDInput).MaCapCA})
        SELECT * FROM CATTPvaTDs WHERE MaCATTPvaTD = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editCATTPvaTD(caTTPvaTDInput: CATTPvaTDInput, id: number): Promise<CATTPvaTD> {
    const result = await this.caTTPvaTDRepository.query(
      `UPDATE CATTPvaTDs SET 
        CATTPvaTD = ${this.caTTPvaTD_DataInput(caTTPvaTDInput).CATTPvaTD}, 
        MaCapCA = ${this.caTTPvaTD_DataInput(caTTPvaTDInput).MaCapCA} 
        WHERE MaCATTPvaTD = ${id}
        SELECT * FROM CATTPvaTDs WHERE MaCATTPvaTD = ${id}
      `,
    );
    return result[0];
  }

  async deleteCATTPvaTD(id: number): Promise<CATTPvaTD> {
    const result = await this.caTTPvaTDRepository.query(
      `SELECT * FROM CATTPvaTDs WHERE MaCATTPvaTD = ${id}
        DELETE FROM CATTPvaTDs WHERE MaCATTPvaTD = ${id}
      `,
    );
    return result[0];
  }

  // ResolveField

  async CapCA(caTTPvaTD: any): Promise<CapCA> {
    return this.dataloaderService.loaderCapCA.load(caTTPvaTD.MaCapCA);
  }

  async CAQHvaTDs(MaCATTPvaTD: number): Promise<CAQHvaTD[]> {
    return await this.caTTPvaTDRepository.query(
      `SELECT * FROM CAQHvaTDs WHERE MaCATTPvaTD = ${MaCATTPvaTD}`,
    );
  }
  // THE END!








  DeNghiTSNTs(MaCATinhTP: number): Promise<DeNghiTSNT[]> {
    return this.caTTPvaTDRepository.query(
      SP_GET_DATA_DECRYPT('DeNghiTSNTs', `'MaCATinhTP = ${MaCATinhTP}'`, 0, 0)
    )
  }

  QuyetDinhTSNTs(MaCATinhTP: number): Promise<QuyetDinhTSNT[]> {
    return this.caTTPvaTDRepository.query(
      SP_GET_DATA_DECRYPT('QuyetDinhTSNTs', `'MaCATinhTP = ${MaCATinhTP}'`, 0, 0)
    )
  }
}
