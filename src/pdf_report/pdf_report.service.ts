import { ForbiddenException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import PdfPrinter from 'pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { IPDFReport, IPDFReportMedicalRecord } from 'src/shared/interfaces/pdf_report_interface/pdf_report.interface';
import { Professional } from 'src/professional/entities/professional.entity';
import { ClinicalPatient } from 'src/clinical_patients/entities/patient.entity';
import { MedicalRecord } from 'src/medical_record/entities/medicalRecord.entity';

/**
 * As fontes Roboto vêm embutidas no próprio pdfmake (vfs_fonts, em base64).
 * Assim não dependemos de arquivos .ttf no disco nem de copiá-los para o dist.
 * (Na 0.2.20 o módulo exporta o vfs diretamente; os tipos ainda declaram `{ vfs }`)
 */
const vfs: Record<string, string> = (pdfFonts as any).vfs ?? pdfFonts;
const font = (file: string) => Buffer.from(vfs[file], 'base64');

const printer = new PdfPrinter({
  Roboto: {
    normal: font('Roboto-Regular.ttf'),
    bold: font('Roboto-Medium.ttf'),
    italics: font('Roboto-Italic.ttf'),
    bolditalics: font('Roboto-MediumItalic.ttf'),
  },
});

const LOGO_PATH = join(process.cwd(), 'public', 'Logo +Physio_ Cuidado que transforma.png');

const COLORS = {
  primary: '#6558B8',
  primaryLight: '#EEECF8',
  text: '#292544',
  muted: '#77718F',
  border: '#DAD7EC',
  white: '#FFFFFF',
};

@Injectable()
export class PdfReportService {
  private readonly logger = new Logger(PdfReportService.name);
  private logoDataUrl: string | null | undefined;

  constructor(
    @InjectRepository(Professional)
    private readonly _professionalRepository: Repository<Professional>,
    @InjectRepository(ClinicalPatient)
    private readonly _patientRepository: Repository<ClinicalPatient>,
    @InjectRepository(MedicalRecord)
    private readonly _medicalRecordRepository: Repository<MedicalRecord>
  ) {}

  async generatePatientReport(userId: number, patientPublicId: string): Promise<{ buffer: Buffer; fileName: string }> {
    try{
      const professional = await this._professionalRepository.findOne({
        where: { user: { id: userId } },
        relations: { user: true }
      });

      //Somente usuários com perfil profissional podem gerar o relatório
      if(!professional){
        throw new ForbiddenException('Apenas profissionais podem gerar relatórios clínicos');
      }

      const patient = await this._patientRepository.findOne({
        where: {
          publicId: patientPublicId,
          professional: { id: professional.id }
        }
      });

      if(!patient){
        throw new NotFoundException('Paciente não encontrado');
      }

      const medicalRecords = await this._medicalRecordRepository.find({
        where: { patient: { id: patient.id } },
        relations: { evolution: true },
        order: {
          date: 'DESC',
          evolution: { createdAt: 'ASC' }
        }
      });

      const data: IPDFReport = {
        patient: {
          publicId: patient.publicId,
          name: patient.name,
          birthday: patient.birthday,
          gender: patient.gender,
          phone: patient.phone,
          email: patient.email,
          address: patient.address,
          profession: patient.profession,
          nationality: patient.nationality,
        },
        professional: {
          name: professional.user.name,
          email: professional.user.email,
          specialties: professional.specialties ?? [],
          city: professional.city,
          phone: professional.phone,
        },
        medicalRecords: medicalRecords.map((record) => ({
          publicId: record.publicId,
          date: record.date,
          chiefComplaint: record.chiefComplaint,
          diagnosis: record.diagnosis,
          treatmentPlan: record.treatmentPlan,
          observations: record.observations,
          evolutions: (record.evolution ?? []).map((evolution) => ({
            description: evolution.description,
            createdAt: evolution.createdAt,
          })),
        })),
      };

      const buffer = await this.generatePdf(data);
      const fileName = `relatorio-${this.slugify(patient.name)}-${new Date().toISOString().slice(0, 10)}.pdf`;

      return { buffer, fileName };
    }catch(error){
      if(error instanceof HttpException){
        throw error;
      }
      this.logger.error(error);
      throw new InternalServerErrorException('Erro ao gerar o relatório. Por favor, tente novamente mais tarde');
    }
  }

  async generatePdf(data: IPDFReport): Promise<Buffer> {
    const logo = this.getLogo();
    const generatedAt = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    const docDefinition: TDocumentDefinitions = {
      info: {
        title: `Relatório clínico - ${data.patient.name}`,
        subject: 'Relatório de paciente',
        author: data.professional.name,
        creator: '+Physio',
      },

      pageSize: 'A4',
      pageMargins: [40, 50, 40, 55],

      defaultStyle: {
        font: 'Roboto',
        fontSize: 10,
        color: COLORS.text,
        lineHeight: 1.2,
      },

      styles: {
        reportTitle: { fontSize: 18, bold: true, color: COLORS.primary },
        reportSubtitle: { fontSize: 9, color: COLORS.muted, margin: [0, 2, 0, 0] },
        sectionTitle: { fontSize: 12, bold: true, color: COLORS.white },
        label: { fontSize: 8, bold: true, color: COLORS.muted, characterSpacing: 0.3 },
        value: { fontSize: 10, color: COLORS.text },
        recordTitle: { fontSize: 11, bold: true, color: COLORS.primary },
      },

      header: (currentPage: number) =>
        currentPage === 1
          ? null
          : {
              columns: [
                { text: '+Physio | Relatório clínico', fontSize: 8, color: COLORS.muted },
                { text: data.patient.name, alignment: 'right', fontSize: 8, color: COLORS.muted },
              ],
              margin: [40, 22, 40, 0],
            },

      footer: (currentPage: number, pageCount: number) => ({
        margin: [40, 10, 40, 0],
        stack: [
          {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: COLORS.border }],
          },
          {
            columns: [
              { text: `Documento confidencial • Gerado em ${generatedAt}`, fontSize: 7.5, color: COLORS.muted },
              { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', fontSize: 7.5, color: COLORS.muted },
            ],
            margin: [0, 6, 0, 0],
          },
        ],
      }),

      content: [
        this.buildReportHeader(data, logo),

        this.sectionTitle('Dados do paciente'),
        this.infoGrid([
          ['Nome completo', data.patient.name],
          ['Data de nascimento', this.formatBirthday(data.patient.birthday)],
          ['Sexo', data.patient.gender],
          ['Nacionalidade', data.patient.nationality],
          ['Profissão', data.patient.profession],
          ['Telefone', data.patient.phone],
          ['E-mail', data.patient.email],
          ['Endereço', data.patient.address],
        ]),

        this.sectionTitle('Profissional responsável'),
        this.infoGrid([
          ['Nome', data.professional.name],
          ['E-mail', data.professional.email],
          ['Telefone', data.professional.phone],
          ['Cidade', data.professional.city],
          ['Especialidades', data.professional.specialties.join(', ')],
        ]),

        this.sectionTitle('Prontuários e evoluções do quadro'),
        ...(data.medicalRecords.length
          ? data.medicalRecords.map((record, index) => this.buildMedicalRecord(record, index, data.medicalRecords.length))
          : [this.emptyMessage('Nenhum prontuário registrado para este paciente.')]),
      ],
    };

    const pdfDocument = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      pdfDocument.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDocument.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDocument.on('error', reject);
      pdfDocument.end();
    });
  }

  /******=======BLOCOS DE LAYOUT DO RELATÓRIO=========*/

  private buildReportHeader(data: IPDFReport, logo: string | null): Content {
    return {
      table: {
        widths: logo ? [70, '*'] : ['*'],
        body: [[
          ...(logo ? [{ image: logo, width: 62, margin: [0, 0, 0, 0] } as Content] : []),
          {
            stack: [
              { text: 'RELATÓRIO CLÍNICO DO PACIENTE', style: 'reportTitle' },
              { text: '+Physio • Cuidado que transforma', style: 'reportSubtitle' },
              { text: `Paciente: ${data.patient.name}   |   Profissional: ${data.professional.name}`, style: 'reportSubtitle', margin: [0, 8, 0, 0] },
            ],
            margin: [8, 8, 0, 0],
          },
        ]],
      },
      layout: {
        hLineWidth: (i: number) => (i === 1 ? 2 : 0),
        vLineWidth: () => 0,
        hLineColor: () => COLORS.primary,
        paddingBottom: () => 10,
      },
      margin: [0, 0, 0, 6],
    };
  }

  private sectionTitle(title: string): Content {
    return {
      table: {
        widths: ['*'],
        body: [[{ text: title.toUpperCase(), style: 'sectionTitle' }]],
      },
      layout: {
        fillColor: () => COLORS.primary,
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 10,
        paddingTop: () => 6,
        paddingBottom: () => 6,
      },
      margin: [0, 18, 0, 8],
    };
  }

  /**Grade de duas colunas com rótulo + valor */
  private infoGrid(fields: [string, string | undefined | null][]): Content {
    const cells = fields.map(([label, value]): Content => ({
      stack: [
        { text: label.toUpperCase(), style: 'label' },
        { text: value?.toString().trim() || 'Não informado', style: 'value', margin: [0, 2, 0, 0] },
      ],
    }));

    const rows: Content[][] = [];
    for(let i = 0; i < cells.length; i += 2){
      rows.push([cells[i], cells[i + 1] ?? { text: '' }]);
    }

    return {
      table: { widths: ['*', '*'], body: rows },
      layout: {
        fillColor: (rowIndex: number) => (rowIndex % 2 === 0 ? COLORS.primaryLight : null),
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 10,
        paddingRight: () => 10,
        paddingTop: () => 6,
        paddingBottom: () => 6,
      },
    };
  }

  private buildMedicalRecord(record: IPDFReportMedicalRecord, index: number, total: number): Content {
    const field = (label: string, value?: string): Content => ({
      stack: [
        { text: label.toUpperCase(), style: 'label' },
        { text: value?.trim() || 'Não informado', style: 'value', margin: [0, 2, 0, 0] },
      ],
      margin: [0, 0, 0, 8],
    });

    return {
      stack: [
        {
          columns: [
            { text: `Prontuário ${total - index}`, style: 'recordTitle' },
            { text: `Data: ${this.formatDate(record.date)}`, alignment: 'right', fontSize: 9, color: COLORS.muted },
          ],
          margin: [0, 0, 0, 8],
        },
        field('Queixa principal', record.chiefComplaint),
        field('Diagnóstico', record.diagnosis),
        field('Plano de tratamento', record.treatmentPlan),
        field('Observações', record.observations),

        { text: 'EVOLUÇÕES DO QUADRO', style: 'label', color: COLORS.primary, margin: [0, 4, 0, 4] },
        record.evolutions.length
          ? {
              table: {
                headerRows: 1,
                widths: [28, 70, '*'],
                body: [
                  [
                    { text: '#', bold: true, color: COLORS.white, fontSize: 9 },
                    { text: 'Data', bold: true, color: COLORS.white, fontSize: 9 },
                    { text: 'Descrição', bold: true, color: COLORS.white, fontSize: 9 },
                  ],
                  ...record.evolutions.map((evolution, i) => [
                    { text: String(i + 1), fontSize: 9, color: COLORS.muted },
                    { text: this.formatDate(evolution.createdAt), fontSize: 9 },
                    { text: evolution.description, fontSize: 9 },
                  ]),
                ],
              },
              layout: {
                fillColor: (rowIndex: number) =>
                  rowIndex === 0 ? COLORS.primary : rowIndex % 2 === 0 ? COLORS.primaryLight : null,
                hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
                vLineWidth: () => 0,
                hLineColor: () => COLORS.border,
                paddingLeft: () => 6,
                paddingRight: () => 6,
                paddingTop: () => 4,
                paddingBottom: () => 4,
              },
            }
          : this.emptyMessage('Nenhuma evolução registrada neste prontuário.'),
      ],
      margin: [0, 6, 0, 14],
      unbreakable: false,
    };
  }

  private emptyMessage(text: string): Content {
    return { text, italics: true, color: COLORS.muted, margin: [0, 2, 0, 6] };
  }

  /******=======UTILITÁRIOS=========*/

  /**Carrega a logo uma única vez como data URL. Se não existir, o relatório é gerado sem ela */
  private getLogo(): string | null {
    if(this.logoDataUrl !== undefined){
      return this.logoDataUrl;
    }
    if(!existsSync(LOGO_PATH)){
      this.logger.warn(`Logo não encontrada em ${LOGO_PATH}`);
      this.logoDataUrl = null;
      return null;
    }
    this.logoDataUrl = `data:image/png;base64,${readFileSync(LOGO_PATH).toString('base64')}`;
    return this.logoDataUrl;
  }

  private formatDate(date?: Date | string | null): string {
    if(!date) return 'Não informado';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? 'Não informado' : parsed.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  }

  /**Data de nascimento é uma data "pura" (sem horário): formata em UTC para não voltar um dia */
  private formatBirthday(date?: Date | string | null): string {
    if(!date) return 'Não informado';
    const parsed = new Date(date);
    if(Number.isNaN(parsed.getTime())) return 'Não informado';

    const today = new Date();
    let age = today.getUTCFullYear() - parsed.getUTCFullYear();
    const hadBirthday =
      today.getUTCMonth() > parsed.getUTCMonth() ||
      (today.getUTCMonth() === parsed.getUTCMonth() && today.getUTCDate() >= parsed.getUTCDate());
    if(!hadBirthday) age--;

    return `${parsed.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} (${age} anos)`;
  }

  private slugify(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'paciente';
  }
}
