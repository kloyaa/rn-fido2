export class AuthenticatorItemDto {
  id!: string;
  deviceName?: string | null;
  enrolledAt!: string;
  lastUsedAt?: string | null;
  status!: string;
}

export class ListAuthenticatorsResponseDto {
  authenticators!: AuthenticatorItemDto[];
}
