export interface IPDFReportEvolution {
  description: string;
  createdAt: Date;
}

export interface IPDFReportMedicalRecord {
  publicId: string;
  date: Date;
  chiefComplaint: string;
  diagnosis: string;
  treatmentPlan: string;
  observations: string;
  evolutions: IPDFReportEvolution[];
}

export interface IPDFReport {
  patient: {
    publicId: string;
    name: string;
    birthday: Date;
    gender: string;
    phone: string;
    email: string;
    address: string;
    profession: string;
    nationality: string;
  };

  professional: {
    name: string;
    email: string;
    specialties: string[];
    city: string;
    phone: string;
  };

  medicalRecords: IPDFReportMedicalRecord[];
}
