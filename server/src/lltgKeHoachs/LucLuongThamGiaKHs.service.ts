import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LucLuongThamGiaKH } from './LucLuongThamGiaKH.model';
import { LucLuongThamGiaKHInput } from './type/LucLuongThamGiaKH.input';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { CBCS } from 'src/cbcss/CBCS.model';
import { DataLoaderService } from 'src/dataloader/Dataloader.service';
import { KeHoachTSNT } from 'src/kehoachTSNTs/KeHoachTSNT.model';

@Injectable()
export class LucLuongThamGiaKHsService {
  constructor(
    @InjectRepository(LucLuongThamGiaKH)
    private lucluongthamgiaKHRepository: Repository<LucLuongThamGiaKH>,
    private dataloaderService: DataLoaderService,
  ) {}
  public readonly lucluongThamGiaKH_DataInput = (
    lucluongThamGiaKHInput: LucLuongThamGiaKHInput,
  ) => {
    return {
      ViTri: lucluongThamGiaKHInput.ViTri ? `N'${lucluongThamGiaKHInput.ViTri}'` : null,
      MaKH: lucluongThamGiaKHInput.MaKH
        ? lucluongThamGiaKHInput.MaKH
        : null,
      MaCBCS: lucluongThamGiaKHInput.MaCBCS
        ? lucluongThamGiaKHInput.MaCBCS
        : null,
    };
  };

  lucluongThamGiaKHs(
    utilsParams: UtilsParamsInput,
  ): Promise<LucLuongThamGiaKH[]> {
    return this.lucluongthamgiaKHRepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM LucLuongThamGiaKHs 
      SELECT * FROM LucLuongThamGiaKHs WHERE ${
        utilsParams.condition ? utilsParams.condition : 'MaLLTGKH != 0'
      } 
      ORDER BY MaLLTGKH OFFSET 
      ${
        utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${
        utilsParams.take && utilsParams.take > 0
          ? utilsParams.take
          : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async lucluongThamGiaKH(id: number): Promise<LucLuongThamGiaKH> {
    const result = await this.lucluongthamgiaKHRepository.query(
      `SELECT * FROM LucLuongThamGiaKHs WHERE MaLLTGKH = ${id}`,
    );
    return result[0];
  }

  async createLucLuongThamGiaKH(
    lucluongThamGiaKHInput: LucLuongThamGiaKHInput,
  ): Promise<LucLuongThamGiaKH> {
    const { ViTri, MaKH, MaCBCS } = this.lucluongThamGiaKH_DataInput(
      lucluongThamGiaKHInput,
    );
    const result = await this.lucluongthamgiaKHRepository.query(
      `INSERT INTO LucLuongThamGiaKHs (ViTri, MaKH, MaCBCS) VALUES (${ViTri}, ${MaKH}, ${MaCBCS})
        SELECT * FROM LucLuongThamGiaKHs WHERE MaLLTGKH = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editLucLuongThamGiaKH(
    lucluongThamGiaKHInput: LucLuongThamGiaKHInput,
    id: number,
  ): Promise<LucLuongThamGiaKH> {
    const { ViTri, MaKH, MaCBCS } = this.lucluongThamGiaKH_DataInput(
      lucluongThamGiaKHInput,
    );
    const result = await this.lucluongthamgiaKHRepository.query(
      `UPDATE LucLuongThamGiaKHs SET ViTri = ${ViTri}, MaKH = ${MaKH}, MaCBCS = ${MaCBCS} 
        WHERE MaLLTGKH = ${id}
        SELECT * FROM LucLuongThamGiaKHs WHERE MaLLTGKH = ${id}
      `,
    );
    return result[0];
  }

  async deleteLucLuongThamGiaKH(id: number): Promise<LucLuongThamGiaKH> {
    const result = await this.lucluongthamgiaKHRepository.query(
      `SELECT * FROM LucLuongThamGiaKHs WHERE MaLLTGKH = ${id}
        DELETE FROM LucLuongThamGiaKHs WHERE MaLLTGKH = ${id}
      `,
    );
    return result[0];
  }

  // ResolveField

  async KeHoachTSNT(lucluongThamGiaKH: any): Promise<KeHoachTSNT> {
    return this.dataloaderService.loaderKeHoachTSNT.load(
      lucluongThamGiaKH.MaKH,
    );
  }

  async CBCS(lucluongThamGiaKH: any): Promise<CBCS> {
    return this.dataloaderService.loaderCBCS.load(lucluongThamGiaKH.MaCBCS);
  }
}
