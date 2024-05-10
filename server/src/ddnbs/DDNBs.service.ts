import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataLoaderService } from 'src/dataloader/Dataloader.service';
import { KetQuaTSNT } from 'src/ketquaTSNTs/KetQuaTSNT.model';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { DDNB } from './DDNB.model';

@Injectable()
export class DDNBsService {
  constructor(
    @InjectRepository(DDNB) private ddnbRepository: Repository<DDNB>,
    private dataloaderService: DataLoaderService,
  ) { }

  ddnbs(utilsParams: UtilsParamsInput): Promise<DDNB[]> {
    return this.ddnbRepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM DDNBs 
      SELECT * FROM DDNBs WHERE ${utilsParams.condition ? utilsParams.condition : 'MaDDNB != 0'
      } 
      ORDER BY MaDDNB OFFSET 
      ${utilsParams.skip && utilsParams.skip > 0 ? utilsParams.skip : 0
      } ROWS FETCH NEXT 
      ${utilsParams.take && utilsParams.take > 0
        ? utilsParams.take
        : '@lengthTable'
      } ROWS ONLY`,
    );
  }

  async ddnb(id: number): Promise<DDNB> {
    const result = await this.ddnbRepository.query(
      `SELECT * FROM DDNBs WHERE MaDDNB = ${id}`,
    );
    return result[0];
  }

  async createDDNB(ddnb: string): Promise<DDNB> {
    const result = await this.ddnbRepository.query(
      `INSERT INTO DDNBs VALUES (N'${ddnb}')
        SELECT * FROM DDNBs WHERE MaDDNB = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editDDNB(ddnb: string, id: number): Promise<DDNB> {
    const result = await this.ddnbRepository.query(
      `UPDATE DDNBs SET DacDiem = N'${ddnb}' WHERE MaDDNB = ${id}
        SELECT * FROM DDNBs WHERE MaDDNB = ${id}
      `,
    );
    return result[0];
  }

  async deleteDDNB(id: number): Promise<DDNB> {
    const result = await this.ddnbRepository.query(
      `SELECT * FROM DDNBs WHERE MaDDNB = ${id}
			  DELETE FROM DDNBs WHERE MaDDNB = ${id}
      `,
    );
    return result[0];
  }

  //  ResolveField

  async KetQuaTSNTs(MaDDNB: number): Promise<KetQuaTSNT[]> {
    const result = (await this.ddnbRepository.query(
      `SELECT MaKQ FROM KetQuaTSNTs_DDNBs WHERE MaDDNB = ${MaDDNB}`,
    )) as [{ MaKQ: number }];
    const resultLoader = result.map((obj) =>
      this.dataloaderService.loaderKetQuaTSNT.load(obj.MaKQ),
    );
    return await Promise.all(resultLoader);
  }
}
