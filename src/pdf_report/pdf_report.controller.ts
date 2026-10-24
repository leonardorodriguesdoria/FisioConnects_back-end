import { Controller, Get, Param, Req, StreamableFile, UseGuards } from '@nestjs/common';
import { PdfReportService } from './pdf_report.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pdf-report')
export class PdfReportController {
  constructor(private readonly pdfReportService: PdfReportService) {}

  /**Gera o relatório clínico (paciente + prontuários + evoluções) em PDF */
  @Get('patient/:publicId')
  async generatePatientReport(
    @Req() request,
    @Param('publicId') publicId: string
  ){
    const { buffer, fileName } = await this.pdfReportService.generatePatientReport(request.user.id, publicId);

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${fileName}"`,
      length: buffer.length,
    });
  }
}
