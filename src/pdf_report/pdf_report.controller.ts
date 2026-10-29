import { Controller, Get, Param, Req, StreamableFile, UseGuards } from '@nestjs/common';
import { PdfReportService } from './pdf_report.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/swagger/api-responses.dto';
import { ApiAuth, ApiInternalError, ApiPublicIdParam } from 'src/common/swagger/api-docs.decorators';

@ApiTags('Relatórios')
@ApiAuth()
@UseGuards(JwtAuthGuard)
@Controller('pdf-report')
export class PdfReportController {
  constructor(private readonly pdfReportService: PdfReportService) {}

  /**Gera o relatório clínico (paciente + prontuários + evoluções) em PDF */
  @ApiOperation({
    summary: 'Gera o relatório clínico do paciente em PDF',
    description:
      'Retorna um PDF (A4) com os dados do paciente, do profissional responsável e todos os prontuários com suas evoluções. ' +
      'O arquivo é enviado como download (`Content-Disposition: attachment`) com o nome `relatorio-<nome-do-paciente>-<AAAA-MM-DD>.pdf`.',
  })
  @ApiPublicIdParam('publicId do paciente clínico')
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'Arquivo PDF do relatório',
    content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
    headers: {
      'Content-Disposition': { description: 'attachment; filename="relatorio-carlos-oliveira-2026-10-29.pdf"', schema: { type: 'string' } },
    },
  })
  @ApiForbiddenResponse({ description: 'Usuário autenticado não é profissional', type: ErrorResponseDto, example: { statusCode: 403, message: 'Apenas profissionais podem gerar relatórios clínicos', error: 'Forbidden' } })
  @ApiNotFoundResponse({ description: 'Paciente não existe ou pertence a outro profissional', type: ErrorResponseDto, example: { statusCode: 404, message: 'Paciente não encontrado', error: 'Not Found' } })
  @ApiInternalError('Erro ao gerar o relatório. Por favor, tente novamente mais tarde')
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
