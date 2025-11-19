export enum EmploymentType {
  Student = 0,
  Employed = 1,
  SelfEmployed = 2,
  BusinessOwner = 3,
  Retired = 4,
  Unemployed = 5,
  Homemaker = 6,
  Professional = 7,
  Farmer = 8,
  Government = 9,
  Private = 10,
  Freelancer = 11
}

export const EmploymentTypeLabels = {
  [EmploymentType.Student]: 'Student',
  [EmploymentType.Employed]: 'Employed (Salaried)',
  [EmploymentType.SelfEmployed]: 'Self Employed',
  [EmploymentType.BusinessOwner]: 'Business Owner',
  [EmploymentType.Retired]: 'Retired',
  [EmploymentType.Unemployed]: 'Unemployed',
  [EmploymentType.Homemaker]: 'Homemaker',
  [EmploymentType.Professional]: 'Professional',
  [EmploymentType.Farmer]: 'Farmer',
  [EmploymentType.Government]: 'Government Employee',
  [EmploymentType.Private]: 'Private Employee',
  [EmploymentType.Freelancer]: 'Freelancer'
} as const;

export const getEmploymentTypeLabel = (type: EmploymentType): string => 
  EmploymentTypeLabels[type] || 'Unknown';
