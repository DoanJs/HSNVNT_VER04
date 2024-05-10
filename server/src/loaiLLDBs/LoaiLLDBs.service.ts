import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LLDB } from 'src/lldbs/LLDB.model';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { LoaiLLDB } from './LoaiLLDB.model';
import { LoaiLLDBInput } from './type/LoaiLLDB.Input';

@Injectable()
export class LoaiLLDBsService {
  constructor(
    @InjectRepository(LoaiLLDB)
    private loaiLLDBRepository: Repository<LoaiLLDB>,
  ) { }

  public readonly loaiLLDB_DataInput = (
    loaiLLDBInput: LoaiLLDBInput,
  ) => {
    return {
      TenLLDB: loaiLLDBInput.TenLLDB
        ? `N'${loaiLLDBInput.TenLLDB}'`
        : null,
      KyHieu: loaiLLDBInput.KyHieu
        ? `N'${loaiLLDBInput.KyHieu}'`
        : null
    };
  };

  loaiLLDBs(utilsParams: UtilsParamsInput): Promise<LoaiLLDB[]> {
    return this.loaiLLDBRepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM LoaiLLDBs 
      SELECT * FROM LoaiLLDBs WHERE ${utilsParams.condition ? utilsParams.condition : 'MaLoaiLLDB != 0'
      } 
      ORDER BY MaLoaiLLDB OFFSET 
      ${utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${utilsParams.take && utilsParams.take > 0
        ? utilsParams.take
        : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async loaiLLDB(id: number): Promise<LoaiLLDB> {
    const result = await this.loaiLLDBRepository.query(
      `SELECT * FROM LoaiLLDBs WHERE MaLoaiLLDB = ${id}`,
    );
    return result[0];
  }

  async createLoaiLLDB(loaiLLDBInput: LoaiLLDBInput): Promise<LoaiLLDB> {
    const { TenLLDB, KyHieu } = this.loaiLLDB_DataInput(loaiLLDBInput)
    const result = await this.loaiLLDBRepository.query(
      `INSERT INTO LoaiLLDBs (TenLLDB, KyHieu) 
        VALUES (${TenLLDB}, ${KyHieu})
        SELECT * FROM LoaiLLDBs WHERE MaLoaiLLDB = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editLoaiLLDB(
    loaiLLDBInput: LoaiLLDBInput,
    id: number,
  ): Promise<LoaiLLDB> {
    const { TenLLDB, KyHieu } = this.loaiLLDB_DataInput(loaiLLDBInput)
    const result = await this.loaiLLDBRepository.query(
      `UPDATE LoaiLLDBs SET 
        TenLLDB = ${TenLLDB}, KyHieu = ${KyHieu} 
        WHERE MaLoaiLLDB = ${id}
        SELECT * FROM LoaiLLDBs WHERE MaLoaiLLDB = ${id}
      `,
    );
    return result[0];
  }

  async deleteLoaiLLDB(id: number): Promise<LoaiLLDB> {
    const result = await this.loaiLLDBRepository.query(
      `SELECT * FROM LoaiLLDBs WHERE MaLoaiLLDB = ${id}
        DELETE FROM LoaiLLDBs WHERE MaLoaiLLDB = ${id}
      `,
    );
    return result[0];
  }

  // ResolveField

  LLDBs(MaLoaiLLDB: number): Promise<LLDB[]> {
    return this.loaiLLDBRepository.query(
      `SELECT * FROM LLDBs WHERE MaLoaiLLDB = ${MaLoaiLLDB}`
    );
  }
}
