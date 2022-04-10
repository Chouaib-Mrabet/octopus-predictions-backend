import { Controller, Get } from '@nestjs/common';
import { Sport } from 'src/schemas/sport.schema';
import { SportsAdminService } from './sports-admin.service';

@Controller('sports-admin')
export class SportsAdminController {
  constructor(private readonly sportsAdminService: SportsAdminService) {}

  @Get('scrapeSports')
  async scrapeSports(): Promise<string[]> {
    let sportsNames: string[] = await this.sportsAdminService.scrapeSports();
    let sports = [];

    for (let i = 0; i < sportsNames.length; i++) {
      sports.push(await this.sportsAdminService.saveSport(sportsNames[i]));
    }
    return sports;
  }
}
