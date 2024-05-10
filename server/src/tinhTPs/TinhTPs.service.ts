import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataLoaderService } from 'src/dataloader/Dataloader.service';
import { DeNghiTSNT } from 'src/denghiTSNTs/DeNghiTSNT.model';
import { KetQuaTSNT } from 'src/ketquaTSNTs/KetQuaTSNT.model';
import { QuyetDinhTSNT } from 'src/quyetdinhTSNTs/QuyetDinhTSNT.model';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { TinhTP } from './TinhTP.model';
import { TinhTPInput } from './type/TinhTP.Input';

@Injectable()
export class TinhTPsService {
  constructor(
    @InjectRepository(TinhTP) private tinhTPRepository: Repository<TinhTP>,
    private dataloaderService: DataLoaderService,
  ) { }

  public readonly tinhTP_DataInput = (
    tinhTPInput: TinhTPInput,
  ) => {
    return {
      TinhTP: tinhTPInput.TinhTP
        ? `N'${tinhTPInput.TinhTP}'`
        : null,
      Cap: tinhTPInput.Cap
        ? `N'${tinhTPInput.Cap}'`
        : null,
    };
  };

  tinhTPs(utilsParams: UtilsParamsInput): Promise<TinhTP[]> {
    return this.tinhTPRepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM TinhTPs 
      SELECT * FROM TinhTPs WHERE ${utilsParams.condition ? utilsParams.condition : 'MaTinhTP != 0'
      } 
      ORDER BY MaTinhTP OFFSET 
      ${utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${utilsParams.take && utilsParams.take > 0
        ? utilsParams.take
        : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async tinhTP(id: number): Promise<TinhTP> {
    const result = await this.tinhTPRepository.query(
      `SELECT * FROM TinhTPs WHERE MaTinhTP = ${id}`,
    );
    return result[0];
  }

  async createTinhTP(tinhTPInput: TinhTPInput): Promise<TinhTP> {
    const { TinhTP, Cap } = this.tinhTP_DataInput(tinhTPInput)
    const result = await this.tinhTPRepository.query(
      `INSERT INTO TinhTPs (TinhTP, Cap) VALUES 
      (${TinhTP}, ${Cap})
        SELECT * FROM TinhTPs WHERE MaTinhTP = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editTinhTP(tinhTPInput: TinhTPInput, id: number): Promise<TinhTP> {
    const { TinhTP, Cap } = this.tinhTP_DataInput(tinhTPInput)
    const result = await this.tinhTPRepository.query(
      `UPDATE TinhTPs SET 
        TinhTP = ${TinhTP}, 
        Cap = ${Cap} 
        WHERE MaTinhTP = ${id}
        SELECT * FROM TinhTPs WHERE MaTinhTP = ${id}
      `,
    );
    return result[0];
  }

  async deleteTinhTP(id: number): Promise<TinhTP> {
    const result = await this.tinhTPRepository.query(
      `SELECT * FROM TinhTPs WHERE MaTinhTP = ${id}
        DELETE FROM TinhTPs WHERE MaTinhTP = ${id}
      `,
    );
    return result[0];
  }

  // ResolveField

  async DeNghiTSNTs(MaTinhTP: number): Promise<DeNghiTSNT[]> {
    const result = (await this.tinhTPRepository.query(
      `SELECT * FROM DeNghiTSNTs_TinhTPs WHERE MaTinhTP = ${MaTinhTP}`,
    )) as [{ MaDN: number }];
    const resultLoader = result.map((obj) =>
      this.dataloaderService.loaderDeNghiTSNT.load(obj.MaDN),
    );
    return await Promise.all(resultLoader);
  }

  async QuyetDinhTSNTs(MaTinhTP: number): Promise<QuyetDinhTSNT[]> {
    const result = (await this.tinhTPRepository.query(
      `SELECT * FROM QuyetDinhTSNTs_TinhTPs WHERE MaTinhTP = ${MaTinhTP}`,
    )) as [{ MaQD: number }];
    const resultLoader = result.map((obj) =>
      this.dataloaderService.loaderQuyetDinhTSNT.load(obj.MaQD),
    );
    return await Promise.all(resultLoader);
  }

  async KetQuaTSNTs(MaTinhTP: number): Promise<KetQuaTSNT[]> {
    console.log(MaTinhTP);
    const result = (await this.tinhTPRepository.query(
      `SELECT * FROM KetQuaTSNTs_TinhTPs WHERE MaTinhTP = ${MaTinhTP}`,
    )) as [{ MaKQTSNT: number }];
    const resultLoader = result.map((obj) =>
      this.dataloaderService.loaderKetQuaTSNT.load(obj.MaKQTSNT),
    );
    return await Promise.all(resultLoader);
  }
}
