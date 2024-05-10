import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CBCS } from 'src/cbcss/CBCS.model';
import { DataLoaderService } from 'src/dataloader/Dataloader.service';
import { DeNghiTSNT } from 'src/denghiTSNTs/DeNghiTSNT.model';
import { SP_GET_DATA_DECRYPT } from 'src/utils/mssql/query';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { KyDuyet_DN } from './KyDuyet_DN.model';
import { KyDuyet_DNInput } from './type/KyDuyet_DN.Input';

@Injectable()
export class KyDuyet_DNsService {
  constructor(
    @InjectRepository(KyDuyet_DN) private kyDuyet_DNRepository: Repository<KyDuyet_DN>,
    private readonly dataloaderService: DataLoaderService,
  ) { }

  public readonly kyduyet_DN_DataInput = (
    kyduyet_DNInput: KyDuyet_DNInput,
  ) => {
    return {
      MaDN: kyduyet_DNInput.MaDN ? kyduyet_DNInput.MaDN : null,
      MaDaiDienCATTPvaTD: kyduyet_DNInput.MaDaiDienCATTPvaTD ? kyduyet_DNInput.MaDaiDienCATTPvaTD : null,
      MaDaiDienDonViDN: kyduyet_DNInput.MaDaiDienDonViDN ? kyduyet_DNInput.MaDaiDienDonViDN : null,
      MaDaiDienDonViTSNT: kyduyet_DNInput.MaDaiDienDonViTSNT ? kyduyet_DNInput.MaDaiDienDonViTSNT : null,
    };
  };

  kyDuyet_DNs(utilsParams: UtilsParamsInput): Promise<KyDuyet_DN[]> {
    return this.kyDuyet_DNRepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM KyDuyet_DNs 
      SELECT * FROM KyDuyet_DNs WHERE ${utilsParams.condition ? utilsParams.condition : 'MaKDDN!=0'
      } 
      ORDER BY MaKDDN OFFSET 
      ${utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${utilsParams.take && utilsParams.take > 0
        ? utilsParams.take
        : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async kyDuyet_DN(id: number): Promise<KyDuyet_DN> {
    const result = await this.kyDuyet_DNRepository.query(
      `SELECT * FROM KyDuyet_DNs WHERE MaKDDN = ${id}`,
    );
    return result[0];
  }

  async createKyDuyet_DN(kyDuyet_DNInput: KyDuyet_DNInput): Promise<KyDuyet_DN> {
    const { MaDN, MaDaiDienCATTPvaTD, MaDaiDienDonViDN, MaDaiDienDonViTSNT } = this.kyduyet_DN_DataInput(kyDuyet_DNInput)
    const result = await this.kyDuyet_DNRepository.query(
      `INSERT INTO KyDuyet_DNs 
        (MaDN, MaDaiDienCATTPvaTD, MaDaiDienDonViDN, MaDaiDienDonViTSNT) 
        VALUES 
        (${MaDN}, ${MaDaiDienCATTPvaTD}, ${MaDaiDienDonViDN}, ${MaDaiDienDonViTSNT})
        SELECT * FROM KyDuyet_DNs WHERE MaKDDN = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editKyDuyet_DN(kyDuyet_DNInput: KyDuyet_DNInput, id: number): Promise<KyDuyet_DN> {
    const { MaDN, MaDaiDienCATTPvaTD, MaDaiDienDonViDN, MaDaiDienDonViTSNT } = this.kyduyet_DN_DataInput(kyDuyet_DNInput)
    const result = await this.kyDuyet_DNRepository.query(
      `UPDATE KyDuyet_DNs SET 
        MaDN = ${MaDN}, 
        MaDaiDienCATTPvaTD = ${MaDaiDienCATTPvaTD}, 
        MaDaiDienDonViDN = ${MaDaiDienDonViDN}, 
        MaDaiDienDonViTSNT = ${MaDaiDienDonViTSNT} 
        WHERE MaKDDN = ${id}
        SELECT * FROM KyDuyet_DNs WHERE MaKDDN = ${id}
      `,
    );
    return result[0];
  }

  async deleteKyDuyet_DN(id: number): Promise<KyDuyet_DN> {
    const result = await this.kyDuyet_DNRepository.query(
      `SELECT * FROM KyDuyet_DNs WHERE MaKDDN = ${id}
			  DELETE FROM KyDuyet_DNs WHERE MaKDDN = ${id}
      `,
    );
    return result[0];
  }

  // ResolveField
  async DeNghiTSNT(kyduyet_DNInput: any): Promise<DeNghiTSNT> {
    const result = await this.kyDuyet_DNRepository.query(
      SP_GET_DATA_DECRYPT('DeNghiTSNTs', `'MaDN  = ${kyduyet_DNInput.MaDN}'`, 0, 1),
    );
    return result[0];
  }

  async DaiDienCATTPvaTD(kyduyet_DNInput: any): Promise<CBCS> {
    return this.dataloaderService.loaderCBCS.load(kyduyet_DNInput.MaDaiDienCATTPvaTD);
  }

  async DaiDienDonViDN(kyduyet_DNInput: any): Promise<CBCS> {
    return this.dataloaderService.loaderCBCS.load(kyduyet_DNInput.MaDaiDienDonViDN);
  }

  async DaiDienDonViTSNT(kyduyet_DNInput: any): Promise<CBCS> {
    return this.dataloaderService.loaderCBCS.load(kyduyet_DNInput.MaDaiDienDonViTSNT);
  }
}
