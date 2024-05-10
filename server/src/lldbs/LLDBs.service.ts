import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CBCS } from 'src/cbcss/CBCS.model';
import { DataLoaderService } from 'src/dataloader/Dataloader.service';
import { KeHoachTSNT } from 'src/kehoachTSNTs/KeHoachTSNT.model';
import { LoaiLLDB } from 'src/loaiLLDBs/LoaiLLDB.model';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { LLDB } from './LLDB.model';
import { LLDBInput } from './type/LLDB.Input';

@Injectable()
export class LLDBsService {
  constructor(
    @InjectRepository(LLDB) private lldbRepository: Repository<LLDB>,
    private dataloaderService: DataLoaderService,
  ) { }
  public readonly lldb_DataInput = (lldbInput: LLDBInput) => {
    return {
      BiDanh: lldbInput.BiDanh ? `N'${lldbInput.BiDanh}'` : null,
      MaTSQuanLy: lldbInput.MaTSQuanLy ? lldbInput.MaTSQuanLy : null,
      MaLoaiLLDB: lldbInput.MaLoaiLLDB ? lldbInput.MaLoaiLLDB : null,
    };
  };

  lldbs(utilsParams: UtilsParamsInput): Promise<LLDB[]> {
    return this.lldbRepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM LLDBs 
      SELECT * FROM LLDBs WHERE ${utilsParams.condition ? utilsParams.condition : 'MaLLDB != 0'
      } 
      ORDER BY MaLLDB OFFSET 
      ${utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${utilsParams.take && utilsParams.take > 0
        ? utilsParams.take
        : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async lldb(id: number): Promise<LLDB> {
    const result = await this.lldbRepository.query(
      `SELECT * FROM LLDBs WHERE MaLLDB = ${id}`,
    );
    return result[0];
  }

  async createLLDB(lldbInput: LLDBInput): Promise<LLDB> {
    const { BiDanh, MaTSQuanLy, MaLoaiLLDB } = this.lldb_DataInput(lldbInput);
    const result = await this.lldbRepository.query(
      `INSERT INTO LLDBs (BiDanh, MaTSQuanLy, MaLoaiLLDB) 
        VALUES (${BiDanh}, ${MaTSQuanLy}, ${MaLoaiLLDB})
        SELECT * FROM LLDBs WHERE MaLLDB = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editLLDB(lldbInput: LLDBInput, id: number): Promise<LLDB> {
    const { BiDanh, MaTSQuanLy, MaLoaiLLDB } = this.lldb_DataInput(lldbInput);
    const result = await this.lldbRepository.query(
      `UPDATE LLDBs SET BiDanh = ${BiDanh}, MaTSQuanLy = ${MaTSQuanLy}, MaLoaiLLDB = ${MaLoaiLLDB} 
        WHERE MaLLDB = ${id}
        SELECT * FROM LLDBs WHERE MaLLDB = ${id}
      `,
    );
    return result[0];
  }

  async deleteLLDB(id: number): Promise<LLDB> {
    const result = await this.lldbRepository.query(
      `SELECT * FROM LLDBs WHERE MaLLDB = ${id}
        DELETE FROM LLDBs WHERE MaLLDB = ${id}
      `,
    );
    return result[0];
  }

  // ResolveField

  async LoaiLLDB(lldb: any): Promise<LoaiLLDB> {
    return this.dataloaderService.loaderLoaiLLDB.load(lldb.MaLoaiLLDB);
  }

  async KeHoachTSNTs(MaLLDB: number): Promise<KeHoachTSNT[]> {
    const result = (await this.lldbRepository.query(
      `SELECT MaKH FROM KeHoachTSNTs_LLDBs WHERE MaLLDB = ${MaLLDB}`,
    )) as [{ MaKH: number }];
    const resultLoader = result.map((obj) =>
      this.dataloaderService.loaderKeHoachTSNT.load(obj.MaKH),
    );
    return await Promise.all(resultLoader);
  }

  async TSQuanLy(lldb: any): Promise<CBCS> {
    return this.dataloaderService.loaderCBCS.load(lldb.MaTSQuanLy);
  }
}
