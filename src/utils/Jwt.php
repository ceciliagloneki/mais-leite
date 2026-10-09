<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Utils;

use InvalidArgumentException;
use RuntimeException;

/**
 * Implementação mínima de JWT (JSON Web Token) com assinatura HS256.
 * Sem dependências externas: utiliza apenas funções nativas do PHP.
 */
final class Jwt
{
    private const ALGORITHM = 'HS256';
    private const HASH = 'sha256';

    /**
     * Gera um token assinado a partir do payload informado.
     */
    public static function encode(array $payload, int $ttl = 3600): string
    {
        $header = ['alg' => self::ALGORITHM, 'typ' => 'JWT'];

        $now = time();
        $payload['iat'] = $now;
        $payload['exp'] = $now + $ttl;

        $segments = [
            self::base64UrlEncode(self::jsonEncode($header)),
            self::base64UrlEncode(self::jsonEncode($payload)),
        ];

        $signingInput = implode('.', $segments);
        $signature = self::sign($signingInput);
        $segments[] = self::base64UrlEncode($signature);

        return implode('.', $segments);
    }

    /**
     * Valida o token e retorna o payload decodificado.
     */
    public static function decode(string $token): array
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            throw new InvalidArgumentException('Token malformado.');
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        $signingInput = $encodedHeader . '.' . $encodedPayload;
        $expectedSignature = self::sign($signingInput);
        $providedSignature = self::base64UrlDecode($encodedSignature);

        if (!hash_equals($expectedSignature, $providedSignature)) {
            throw new InvalidArgumentException('Assinatura do token inválida.');
        }

        $payload = json_decode(self::base64UrlDecode($encodedPayload), true);

        if (!is_array($payload)) {
            throw new InvalidArgumentException('Payload do token inválido.');
        }

        if (isset($payload['exp']) && time() >= (int) $payload['exp']) {
            throw new InvalidArgumentException('Token expirado.');
        }

        return $payload;
    }

    private static function sign(string $input): string
    {
        return hash_hmac(self::HASH, $input, self::secret(), true);
    }

    private static function secret(): string
    {
        $secret = $_ENV['APP_SECRET'] ?? getenv('APP_SECRET') ?: null;

        if ($secret === null || $secret === '') {
            throw new RuntimeException('APP_SECRET não configurado.');
        }

        return (string) $secret;
    }

    private static function jsonEncode(array $data): string
    {
        return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;

        if ($remainder !== 0) {
            $data .= str_repeat('=', 4 - $remainder);
        }

        $decoded = base64_decode(strtr($data, '-_', '+/'), true);

        if ($decoded === false) {
            throw new InvalidArgumentException('Token malformado.');
        }

        return $decoded;
    }
}
