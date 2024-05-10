import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { DauMoiPH_DN } from './DauMoiPH_DN.model';
import { DauMoiPH_DNInput } from './type/DauMoiPH_DN.input';
import { CBCS } from 'src/cbcss/CBCS.model';
import { DeNghiTSNT } from 'src/denghiTSNTs/DeNghiTSNT.model';
import { SP_GET_DATA_DECRYPT } from 'src/utils/mssql/query';
import { DataLoaderService } from 'src/dataloader/Dataloader.service';

@Injectable()
export class DauMoiPH_DNsService {
  constructor(
    @InjectRepository(DauMoiPH_DN) private dauMoiPH_DNRepository: Repository<DauMoiPH_DN>,
    private readonly dataloaderService: DataLoaderService,
  ) { }

  public readonly daumoiPH_DN_DataInput = (
    daumoiPH_DNInput: DauMoiPH_DNInput,
  ) => {
    return {
      MaDN: daumoiPH_DNInput.MaDN ? daumoiPH_DNInput.MaDN : null,
      MaLDDonViDN: daumoiPH_DNInput.MaLDDonViDN ? daumoiPH_DNInput.MaLDDonViDN : null,
      MaCBTrucTiepPH: daumoiPH_DNInput.MaCBTrucTiepPH ? daumoiPH_DNInput.MaCBTrucTiepPH : null,
    };
  };

  dauMoiPH_DNs(utilsParams: UtilsParamsInput): Promise<DauMoiPH_DN[]> {
    return this.dauMoiPH_DNRepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM DauMoiPH_DNs 
      SELECT * FROM DauMoiPH_DNs WHERE ${utilsParams.condition ? utilsParams.condition : 'MaDMPH!=0'
      } 
      ORDER BY MaDMPH OFFSET 
      ${utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${utilsParams.take && utilsParams.take > 0
        ? utilsParams.take
        : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async dauMoiPH_DN(id: number): Promise<DauMoiPH_DN> {
    const result = await this.dauMoiPH_DNRepository.query(
      `SELECT * FROM DauMoiPH_DNs WHERE MaDMPH = ${id}`,
    );
    return result[0];
  }

  async createDauMoiPH_DN(dauMoiPH_DNInput: DauMoiPH_DNInput): Promise<DauMoiPH_DN> {
    const result = await this.dauMoiPH_DNRepository.query(
      `INSERT INTO DauMoiPH_DNs (MaDN, MaLDDonViDN, MaCBTrucTiepPH) 
      VALUES 
      (${this.daumoiPH_DN_DataInput(dauMoiPH_DNInput).MaDN}, 
        ${this.daumoiPH_DN_DataInput(dauMoiPH_DNInput).MaLDDonViDN}, 
        ${this.daumoiPH_DN_DataInput(dauMoiPH_DNInput).MaCBTrucTiepPH})
        SELECT * FROM DauMoiPH_DNs WHERE MaDMPH = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editDauMoiPH_DN(dauMoiPH_DNInput: DauMoiPH_DNInput, id: number): Promise<DauMoiPH_DN> {
    const result = await this.dauMoiPH_DNRepository.query(
      `UPDATE DauMoiPH_DNs SET 
        MaDN = ${this.daumoiPH_DN_DataInput(dauMoiPH_DNInput).MaDN}, 
        MaLDDonViDN = ${this.daumoiPH_DN_DataInput(dauMoiPH_DNInput).MaLDDonViDN}, 
        MaCBTrucTiepPH = ${this.daumoiPH_DN_DataInput(dauMoiPH_DNInput).MaCBTrucTiepPH}
        WHERE MaDMPH = ${id}
        SELECT * FROM DauMoiPH_DNs WHERE MaDMPH = ${id}
      `,
    );
    return result[0];
  }

  async deleteDauMoiPH_DN(id: number): Promise<DauMoiPH_DN> {
    const result = await this.dauMoiPH_DNRepository.query(
      `SELECT * FROM DauMoiPH_DNs WHERE MaDMPH = ${id}
			  DELETE FROM DauMoiPH_DNs WHERE MaDMPH = ${id}
      `,
    );
    return result[0];
  }

  // ResolveField

  async DeNghiTSNT(dauMoiPH_DN: any): Promise<DeNghiTSNT> {
    const result = await this.dauMoiPH_DNRepository.query(
      SP_GET_DATA_DECRYPT('DeNghiTSNTs', `"MaDN = ${dauMoiPH_DN.MaDN}"`, 0, 1),
    );
    return result[0];
  }

  async LDDonViDN(dauMoiPH_DN: any): Promise<CBCS> {
    return this.dataloaderService.loaderCBCS.load(dauMoiPH_DN.MaLDDonViDN);
  }

  async CBTrucTiepPH(dauMoiPH_DN: any): Promise<CBCS> {
    return this.dataloaderService.loaderCBCS.load(dauMoiPH_DN.MaCBTrucTiepPH);
  }
}
