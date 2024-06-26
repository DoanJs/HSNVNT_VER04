import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { BaoCaoKQXMDiaChi } from './BaoCaoKQXMDiaChi.model';
import BaoCaoKQXMDiaChisService from './BaoCaoKQXMDiaChis.service';
import { UtilsParamsInput } from 'src/utils/type/UtilsParams.input';
import { BaoCaoKQXMDiaChiInput } from './type/BaoCaoKQXMDiaChi.input';
import { DiaChiNV } from 'src/diachiNVs/DiaChiNV.model';
import { CAQHvaTD } from 'src/caQHvaTD/CAQHvaTD.model';
import { Doi } from 'src/dois/Doi.model';
import { CBCS } from 'src/cbcss/CBCS.model';

@Resolver(() => BaoCaoKQXMDiaChi)
export class BaoCaoKQXMDiaChisResolver {
  constructor(private baocaoKQXMDiaChisService: BaoCaoKQXMDiaChisService) {}
  @Query((returns) => [BaoCaoKQXMDiaChi])
  baocaoKQXMDiaChis(
    @Args('utilsParams') utilsParams: UtilsParamsInput,
  ): Promise<BaoCaoKQXMDiaChi[]> {
    return this.baocaoKQXMDiaChisService.baocaoKQXMDiaChis(utilsParams);
  }

  @Query((returns) => BaoCaoKQXMDiaChi)
  baocaoKQXMDiaChi(@Args('id') id: number): Promise<BaoCaoKQXMDiaChi> {
    return this.baocaoKQXMDiaChisService.baocaoKQXMDiaChi(id);
  }

  @Mutation((returns) => BaoCaoKQXMDiaChi)
  createBaoCaoKQXMDiaChi(
    @Args('baocaoKQXMDiaChiInput') baocaoKQXMDiaChiInput: BaoCaoKQXMDiaChiInput,
  ): Promise<BaoCaoKQXMDiaChi> {
    return this.baocaoKQXMDiaChisService.createBaoCaoKQXMDiaChi(
      baocaoKQXMDiaChiInput,
    );
  }

  @Mutation((returns) => BaoCaoKQXMDiaChi)
  editBaoCaoKQXMDiaChi(
    @Args('baocaoKQXMDiaChiInput') baocaoKQXMDiaChiInput: BaoCaoKQXMDiaChiInput,
    @Args('id') id: number,
  ): Promise<BaoCaoKQXMDiaChi> {
    return this.baocaoKQXMDiaChisService.editBaoCaoKQXMDiaChi(
      baocaoKQXMDiaChiInput,
      id,
    );
  }

  @Mutation((retursn) => BaoCaoKQXMDiaChi)
  deleteBaoCaoKQXMDiaChi(
    @Args('baocaoKQXMDiaChiInput') baocaoKQXMDiaChiInput: BaoCaoKQXMDiaChiInput,
    @Args('id') id: number,
  ): Promise<BaoCaoKQXMDiaChi> {
    return this.baocaoKQXMDiaChisService.deleteBaoCaoKQXMDiaChi(
      baocaoKQXMDiaChiInput,
      id,
    );
  }

  // ResolveField
  @ResolveField((returns) => DiaChiNV)
  DiaChiNV(@Parent() baocaoKQXMDiaChi: BaoCaoKQXMDiaChi): Promise<DiaChiNV> {
    return this.baocaoKQXMDiaChisService.DiaChiNV(baocaoKQXMDiaChi);
  }

  @ResolveField((returns) => CAQHvaTD)
  DonVi(@Parent() baocaoKQXMDiaChi: BaoCaoKQXMDiaChi): Promise<CAQHvaTD> {
    return this.baocaoKQXMDiaChisService.DonVi(baocaoKQXMDiaChi);
  }

  @ResolveField((returns) => Doi)
  Doi(@Parent() baocaoKQXMDiaChi: BaoCaoKQXMDiaChi): Promise<Doi> {
    return this.baocaoKQXMDiaChisService.Doi(baocaoKQXMDiaChi);
  }

  @ResolveField((returns) => CBCS)
  TSXacMinh(@Parent() baocaoKQXMDiaChi: BaoCaoKQXMDiaChi): Promise<CBCS> {
    return this.baocaoKQXMDiaChisService.TSXacMinh(baocaoKQXMDiaChi);
  }

  @ResolveField((returns) => CBCS)
  LanhDaoPD(@Parent() baocaoKQXMDiaChi: BaoCaoKQXMDiaChi): Promise<CBCS> {
    return this.baocaoKQXMDiaChisService.LanhDaoPD(baocaoKQXMDiaChi);
  }

  @ResolveField((returns) => CBCS)
  BanChiHuy(@Parent() baocaoKQXMDiaChi: BaoCaoKQXMDiaChi): Promise<CBCS> {
    return this.baocaoKQXMDiaChisService.BanChiHuy(baocaoKQXMDiaChi);
  }
}
