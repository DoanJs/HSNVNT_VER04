import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DanhGiaTSTH } from './DanhGiaTSTH.model';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { DanhGiaTSTHInput } from './type/DanhGiaTSTH.input';
import { KetQuaTSNT } from 'src/ketquaTSNTs/KetQuaTSNT.model';
import { DataLoaderService } from 'src/dataloader/Dataloader.service';
import { CBCS } from 'src/cbcss/CBCS.model';

@Injectable()
export class DanhGiaTSTHsService {
  constructor(
    @InjectRepository(DanhGiaTSTH)
    private danhgiaTSTHRepository: Repository<DanhGiaTSTH>,
    private dataloaderService: DataLoaderService,
  ) { }

  public readonly danhgiaTSTH_DataInput = (
    danhgiaTSTHInput: DanhGiaTSTHInput,
  ) => {
    return {
      VaiTro: danhgiaTSTHInput.VaiTro ? `N'${danhgiaTSTHInput.VaiTro}'` : null,
      DanhGia: danhgiaTSTHInput.DanhGia ? `N'${danhgiaTSTHInput.DanhGia}'` : null,
      LyDo: danhgiaTSTHInput.LyDo ? `N'${danhgiaTSTHInput.LyDo}'` : null,
      MaKQ: danhgiaTSTHInput.MaKQ ? danhgiaTSTHInput.MaKQ : null,
      MaCBCS: danhgiaTSTHInput.MaCBCS ? danhgiaTSTHInput.MaCBCS : null,
    };
  };

  danhgiaTSTHs(utilsParams: UtilsParamsInput): Promise<DanhGiaTSTH[]> {
    return this.danhgiaTSTHRepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM DanhGiaTSTHs 
      SELECT * FROM DanhGiaTSTHs WHERE ${utilsParams.condition ? utilsParams.condition : 'MaDanhGiaTSTH != 0'
      } 
      ORDER BY MaDanhGiaTSTH OFFSET 
      ${utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${utilsParams.take && utilsParams.take > 0
        ? utilsParams.take
        : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async danhgiaTSTH(id: number): Promise<DanhGiaTSTH> {
    const result = await this.danhgiaTSTHRepository.query(
      `SELECT * FROM DanhGiaTSTHs WHERE MaDanhGiaTSTH = ${id}`,
    );
    return result[0];
  }

  async createDanhGiaTSTH(
    danhgiaTSTHInput: DanhGiaTSTHInput,
  ): Promise<DanhGiaTSTH> {
    const result = await this.danhgiaTSTHRepository.query(
      `INSERT INTO DanhGiaTSTHs (VaiTro, DanhGia, LyDo, MaKQ, MaCBCS) 
            VALUES 
        (
          ${this.danhgiaTSTH_DataInput(danhgiaTSTHInput).VaiTro}, 
          ${this.danhgiaTSTH_DataInput(danhgiaTSTHInput).DanhGia}, 
          ${this.danhgiaTSTH_DataInput(danhgiaTSTHInput).LyDo}, 
          ${this.danhgiaTSTH_DataInput(danhgiaTSTHInput).MaKQ}, 
          ${this.danhgiaTSTH_DataInput(danhgiaTSTHInput).MaCBCS}
        )
        SELECT * FROM DanhGiaTSTHs WHERE MaDanhGiaTSTH = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editDanhGiaTSTH(
    danhgiaTSTHInput: DanhGiaTSTHInput,
    id: number,
  ): Promise<DanhGiaTSTH> {
    const result = await this.danhgiaTSTHRepository.query(
      `UPDATE DanhGiaTSTHs SET 
          VaiTro = ${this.danhgiaTSTH_DataInput(danhgiaTSTHInput).VaiTro},
          DanhGia = ${this.danhgiaTSTH_DataInput(danhgiaTSTHInput).DanhGia},
          LyDo = ${this.danhgiaTSTH_DataInput(danhgiaTSTHInput).LyDo},
          MaKQ = ${this.danhgiaTSTH_DataInput(danhgiaTSTHInput).MaKQ},
          MaCBCS = ${this.danhgiaTSTH_DataInput(danhgiaTSTHInput).MaCBCS}
        WHERE MaDanhGiaTSTH = ${id}
        SELECT * FROM DanhGiaTSTHs WHERE MaDanhGiaTSTH = ${id}
      `,
    );
    return result[0];
  }

  async deleteDanhGiaTSTH(id: number): Promise<DanhGiaTSTH> {
    const result = await this.danhgiaTSTHRepository.query(
      `SELECT * FROM DanhGiaTSTHs WHERE MaDanhGiaTSTH = ${id}
			  DELETE FROM DanhGiaTSTHs WHERE MaDanhGiaTSTH = ${id}
      `,
    );
    return result[0];
  }

  // ResolverField
  async KetQuaTSNT(danhgiaTSTH: any): Promise<KetQuaTSNT> {
    return this.dataloaderService.loaderKetQuaTSNT.load(danhgiaTSTH.MaKQ);
  }

  async CBCS(danhgiaTSTH: any): Promise<CBCS> {
    return this.dataloaderService.loaderCBCS.load(danhgiaTSTH.MaCBCS);
  }
}
