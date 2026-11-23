<?php

declare(strict_types=1);

namespace MaisLeiteBackend\Services;

use MaisLeiteBackend\Dtos\Auth\LoginDTO;
use MaisLeiteBackend\Dtos\Auth\LoginResponseDTO;
use MaisLeiteBackend\Enums\StatusEnum;
use MaisLeiteBackend\Repositories\FuncionarioRepository;
use RuntimeException;

final class AuthService
{
    public function __construct(private readonly ?FuncionarioRepository $repository = null) {}

    public function login(LoginDTO $dto): array
    {
        $repository = $this->repository ?? throw new RuntimeException('Repositório de funcionários não configurado.');
        $funcionario = $repository->findByEmail($dto->email);

        if ($funcionario === null || !password_verify($dto->senha, $funcionario['senha'])) {
            throw new RuntimeException('E-mail ou senha incorretos.', 401);
        }
        if ($funcionario['status'] !== StatusEnum::ATIVO->value) {
            throw new RuntimeException('Funcionário inativo. Entre em contato com o administrador.', 403);
        }

        return LoginResponseDTO::fromFuncionario($funcionario, $this->createToken($funcionario));
    }

    public function validateToken(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3 || $parts[0] !== $this->base64UrlEncode('{"alg":"HS256","typ":"JWT"}')) {
            return null;
        }

        $expected = $this->base64UrlEncode(hash_hmac('sha256', "$parts[0].$parts[1]", $this->secret(), true));
        if (!hash_equals($expected, $parts[2])) {
            return null;
        }

        $payload = json_decode($this->base64UrlDecode($parts[1]), true);
        if (!is_array($payload) || !isset($payload['sub'], $payload['email'], $payload['exp']) || (int) $payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    private function createToken(array $funcionario): string
    {
        $header = $this->base64UrlEncode('{"alg":"HS256","typ":"JWT"}');
        $payload = $this->base64UrlEncode((string) json_encode([
            'sub' => (int) $funcionario['id'],
            'email' => $funcionario['email'],
            'exp' => time() + 60 * 60 * 8,
        ]));
        $signature = $this->base64UrlEncode(hash_hmac('sha256', "$header.$payload", $this->secret(), true));

        return "$header.$payload.$signature";
    }

    private function secret(): string
    {
        return $_ENV['APP_SECRET'] ?? 'mais-leite-chave-local-para-desenvolvimento';
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string
    {
        return (string) base64_decode(strtr($value, '-_', '+/'), true);
    }
}
