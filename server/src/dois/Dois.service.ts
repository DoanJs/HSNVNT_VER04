import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaoCaoKQGH } from 'src/baocaoKQGHs/BaoCaoKQGH.model';
import { BaoCaoKQXMDiaChi } from 'src/baocaoKQXMDiaChis/BaoCaoKQXMDiaChi.model';
import { BaoCaoKQXMQuanHe } from 'src/baocaoKQXMQuanHes/BaoCaoKQXMQuanHe.model';
import { BaoCaoPHQH } from 'src/baocaoPHQHs/BaoCaoPHQH.model';
import { CAQHvaTD } from 'src/caQHvaTD/CAQHvaTD.model';
import { CBCS } from 'src/cbcss/CBCS.model';
import { DataLoaderService } from 'src/dataloader/Dataloader.service';
import { KeHoachTSNT } from 'src/kehoachTSNTs/KeHoachTSNT.model';
import { QuyetDinhTSNT } from 'src/quyetdinhTSNTs/QuyetDinhTSNT.model';
import { TramCT } from 'src/tramCTs/TramCT.model';
import { SP_GET_DATA_DECRYPT } from 'src/utils/mssql/query';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { Doi } from './Doi.model';
import { DoiInput } from './type/Doi.Input';

@Injectable()
export class DoisService {
  constructor(@InjectRepository(Doi) private doiRepository: Repository<Doi>,
    private readonly dataloaderService: DataLoaderService,
  ) { }

  public readonly doi_DataInput = (
    doiInput: DoiInput,
  ) => {
    return {
      TenDoi: doiInput.TenDoi ? `N'${doiInput.TenDoi}'` : null,
      MaCAQHvaTD: doiInput.MaCAQHvaTD ? doiInput.MaCAQHvaTD : null,
    };
  };

  dois(utilsParams: UtilsParamsInput): Promise<Doi[]> {
    return this.doiRepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM Dois 
      SELECT * FROM Dois WHERE ${utilsParams.condition ? utilsParams.condition : 'MaDoi != 0'
      } 
      ORDER BY MaDoi OFFSET 
      ${utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${utilsParams.take && utilsParams.take > 0
        ? utilsParams.take
        : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async doi(id: number): Promise<Doi> {
    const result = await this.doiRepository.query(
      `SELECT * FROM Dois WHERE MaDoi = ${id}`,
    );
    return result[0];
  }

  async createDoi(doiInput: DoiInput): Promise<Doi> {
    const result = await this.doiRepository.query(
      `INSERT INTO Dois (TenDoi, MaCAQHvaTD) 
        VALUES 
        (${this.doi_DataInput(doiInput).TenDoi}, ${this.doi_DataInput(doiInput).MaCAQHvaTD})
        SELECT * FROM Dois WHERE MaDoi = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editDoi(doiInput: DoiInput, id: number): Promise<Doi> {
    const result = await this.doiRepository.query(
      `UPDATE Dois SET 
        TenDoi = ${this.doi_DataInput(doiInput).TenDoi}, 
        MaCAQHvaTD = ${this.doi_DataInput(doiInput).MaCAQHvaTD}
        WHERE MaDoi = ${id}
        SELECT * FROM Dois WHERE MaDoi = ${id}
      `,
    );
    return result[0];
  }

  async deleteDoi(id: number): Promise<Doi> {
    const result = await this.doiRepository.query(
      `SELECT * FROM Dois WHERE MaDoi = ${id}
			  DELETE FROM Dois WHERE MaDoi = ${id}
      `,
    );
    return result[0];
  }

  // ResolveField

  async CAQHvaTD(doi: any): Promise<CAQHvaTD> {
    return this.dataloaderService.loaderCAQHvaTD.load(doi.MaCAQHvaTD);
  }








  QuyetDinhTSNTs(MaDoi: number): Promise<QuyetDinhTSNT[]> {
    return this.doiRepository.query(
      SP_GET_DATA_DECRYPT('QuyetDinhTSNTs', `'MaDoi = ${MaDoi}'`, 0, 0),
    );
  }

  CBCSs(MaDoi: number): Promise<CBCS[]> {
    return this.doiRepository.query(
      SP_GET_DATA_DECRYPT('CBCSs', `'MaDoi = ${MaDoi}'`, 0, 0),
    );
  }

  KeHoachTSNTs(MaDoi: number): Promise<KeHoachTSNT[]> {
    return this.doiRepository.query(
      SP_GET_DATA_DECRYPT('KeHoachTSNTs', `'MaDoi = ${MaDoi}'`, 0, 0),
    );
  }

  TramCTs(MaDoi: number): Promise<TramCT[]> {
    return this.doiRepository.query(
      SP_GET_DATA_DECRYPT('TramCTs', `'MaDoi = ${MaDoi}'`, 0, 0),
    );
  }

  BaoCaoPHQHs(MaDoi: number): Promise<BaoCaoPHQH[]> {
    return this.doiRepository.query(
      SP_GET_DATA_DECRYPT('BaoCaoPHQHs', `'MaDoi = ${MaDoi}'`, 0, 0),
    );
  }

  BaoCaoKQGHs(MaDoi: number): Promise<BaoCaoKQGH[]> {
    return this.doiRepository.query(
      SP_GET_DATA_DECRYPT('BaoCaoKQGHs', `'MaDoi = ${MaDoi}'`, 0, 0),
    );
  }
  BaoCaoKQXMQuanHes(MaDoi: number): Promise<BaoCaoKQXMQuanHe[]> {
    return this.doiRepository.query(
      SP_GET_DATA_DECRYPT('BaoCaoKQXMQuanHes', `'MaDoi = ${MaDoi}'`, 0, 0),
    );
  }
  BaoCaoKQXMDiaChis(MaDoi: number): Promise<BaoCaoKQXMDiaChi[]> {
    return this.doiRepository.query(
      SP_GET_DATA_DECRYPT('BaoCaoKQXMDiaChis', `'MaDoi = ${MaDoi}'`, 0, 0),
    );
  }
}
