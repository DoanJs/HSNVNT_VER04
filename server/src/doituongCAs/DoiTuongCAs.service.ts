import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChuyenAn } from 'src/chuyenans/ChuyenAn.model';
import { DataLoaderService } from 'src/dataloader/Dataloader.service';
import { DoiTuong } from 'src/doituongs/DoiTuong.model';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { Repository } from 'typeorm';
import { DoiTuongCA } from './DoiTuongCA.model';
import { DoiTuongCAInput } from './type/DoiTuongCA.input';

@Injectable()
export class DoiTuongCAsService {
  constructor(
    @InjectRepository(DoiTuongCA)
    private doituongCARepository: Repository<DoiTuongCA>,
    private readonly dataloaderService: DataLoaderService,
  ) {}

  public readonly doituongCA_DataInput = (doituongCAInput: DoiTuongCAInput) => {
    return {
      BiSo: doituongCAInput.BiSo ? `N'${doituongCAInput.BiSo}'` : null,
      ViTri: doituongCAInput.ViTri ? `N'${doituongCAInput.ViTri}'` : null,
      MaCA: doituongCAInput.MaCA ? doituongCAInput.MaCA : null,
      MaDoiTuong: doituongCAInput.MaDoiTuong
        ? doituongCAInput.MaDoiTuong
        : null,
    };
  };

  doituongCAs(utilsParams: UtilsParamsInput): Promise<DoiTuongCA[]> {
    return this.doituongCARepository.query(
      `DECLARE @lengthTable INT
      SELECT @lengthTable = COUNT(*) FROM DoiTuongCAs 
      SELECT * FROM DoiTuongCAs WHERE ${
        utilsParams.condition ? utilsParams.condition : 'MaDTCA != 0'
      } 
      ORDER BY MaDTCA OFFSET 
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

  // async doituongCAsOpen(
  //   conditionCol: string,
  //   value: string,
  // ): Promise<DoiTuongCA[]> {
  //   return await this.doituongCARepository.query(
  //     `SELECT * FROM DoiTuongCAs WHERE ${conditionCol} = ${value}`,
  //   );
  // }

  async doituongCA(id: number): Promise<DoiTuongCA> {
    const result = await this.doituongCARepository.query(
      `SELECT * FROM DoiTuongCAs WHERE MaDTCA = ${id}`,
    );
    return result[0];
  }

  async createDoiTuongCA(
    doituongCAInput: DoiTuongCAInput,
  ): Promise<DoiTuongCA> {
    const { BiSo, ViTri, MaCA, MaDoiTuong } =
      this.doituongCA_DataInput(doituongCAInput);
    const result = await this.doituongCARepository.query(
      `INSERT INTO DoiTuongCAs (BiSo, ViTri, MaCA, MaDoiTuong) 
          VALUES (${BiSo}, ${ViTri}, ${MaCA}, ${MaDoiTuong})
        SELECT * FROM DoiTuongCAs WHERE MaDTCA = SCOPE_IDENTITY()
      `,
    );
    return result[0];
  }

  async editDoiTuongCA(
    doituongCAInput: DoiTuongCAInput,
    id: number,
  ): Promise<DoiTuongCA> {
    const { BiSo, ViTri, MaCA, MaDoiTuong } =
      this.doituongCA_DataInput(doituongCAInput);
    const result = await this.doituongCARepository.query(
      `UPDATE DoiTuongCAs SET 
          BiSo = ${BiSo},
          ViTri = ${ViTri},
          MaCA = ${MaCA},
          MaDoiTuong = ${MaDoiTuong}
        WHERE MaDTCA = ${id}
        SELECT * FROM DoiTuongCAs WHERE MaDTCA = ${id}
      `,
    );
    return result[0];
  }

  async deleteDoiTuongCA(id: number): Promise<DoiTuongCA> {
    const result = await this.doituongCARepository.query(
      `SELECT * FROM DoiTuongCAs WHERE MaDTCA = ${id}
			  DELETE FROM DoiTuongCAs WHERE MaDTCA = ${id}
      `,
    );
    return result[0];
  }

  // ResolveField

  async ChuyenAn(doituongCA: any): Promise<ChuyenAn> {
    return this.dataloaderService.loaderChuyenAn.load(doituongCA.MaCA);
  }

  async DoiTuong(doituongCA: any): Promise<DoiTuong> {
    return this.dataloaderService.loaderDoiTuong.load(doituongCA.MaDoiTuong);
  }
}
