import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CBCS } from 'src/cbcss/CBCS.model';
import { DataLoaderService } from 'src/dataloader/Dataloader.service';
import { DoiTuong } from 'src/doituongs/DoiTuong.model';
import { QuocTich } from 'src/quoctichs/QuocTich.model';
import { SP_GET_DATA_DECRYPT } from 'src/utils/mssql/query';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { DanToc } from './DanToc.model';
import { DanTocInput } from './type/DanToc.Input';

@Injectable()
export class DanTocsService {
  constructor(
    @InjectRepository(DanToc) private dantocRepository: Repository<DanToc>,
    @InjectRepository(CBCS) private cbcsRepository: Repository<CBCS>,
    private readonly dataloaderService: DataLoaderService,
  ) { }

  public readonly dantoc_DataInput = (
    dantocInput: DanTocInput,
  ) => {
    return {
      TenDT: dantocInput.TenDT ? `N'${dantocInput.TenDT}'` : null,
      MaQT: dantocInput.MaQT ? dantocInput.MaQT : null,
    };
  };

  dantocs(utilsParams: UtilsParamsInput): Promise<DanToc[]> {
    return this.dantocRepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM DanTocs 
      SELECT * FROM DanTocs WHERE ${utilsParams.condition ? utilsParams.condition : 'MaDT != 0'
      } 
      ORDER BY MaDT OFFSET 
      ${utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${utilsParams.take && utilsParams.take > 0
        ? utilsParams.take
        : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async dantoc(id: number): Promise<DanToc> {
    const result = await this.dantocRepository.query(
      `SELECT * FROM DanTocs WHERE MaDT = ${id}`,
    );
    return result[0];
  }

  async createDanToc(danTocInput: DanTocInput): Promise<DanToc> {
    const result = await this.dantocRepository.query(
      `INSERT INTO DanTocs VALUES 
        (${this.dantoc_DataInput(danTocInput).TenDT}, ${this.dantoc_DataInput(danTocInput).MaQT})
        SELECT * FROM DanTocs WHERE MaDT = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editDanToc(danTocInput: DanTocInput, id: number): Promise<DanToc> {
    const result = await this.dantocRepository.query(
      `UPDATE DanTocs SET 
        TenDT = ${this.dantoc_DataInput(danTocInput).TenDT}, 
        MaQT = ${this.dantoc_DataInput(danTocInput).MaQT} 
        WHERE MaDT = ${id}
        SELECT * FROM DanTocs WHERE MaDT = ${id}
      `,
    );
    return result[0];
  }

  async deleteDanToc(id: number): Promise<DanToc> {
    const result = await this.dantocRepository.query(
      `SELECT * FROM DanTocs WHERE MaDT = ${id}
			  DELETE FROM DanTocs WHERE MaDT = ${id}
      `,
    );
    return result[0];
  }


  //  ResolveField

  async QuocTich(danToc: any): Promise<QuocTich> {
    return this.dataloaderService.loaderQuocTich.load(danToc.MaQT);
  }







  DoiTuongs(MaDT: number): Promise<DoiTuong[]> {
    return this.dantocRepository.query(
      SP_GET_DATA_DECRYPT('DoiTuongs', `'MaDT = ${MaDT}'`, 0, 0)
    )
  }

  CBCSs(MaDT: number): Promise<CBCS[]> {
    return this.cbcsRepository.query(
      SP_GET_DATA_DECRYPT('CBCSs', `'MaDT = ${MaDT}'`, 0, 0),
    );
  }
}
