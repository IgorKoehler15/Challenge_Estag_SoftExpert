<?php

require_once __DIR__ . '/../Services/CategoryService.php';

class CategoryController
{
    private CategoryService $service;

    public function __construct(PDO $pdo)
    {
        $this->service = new CategoryService($pdo);
    }

    // Roteia a requisição para o método adequado
    public function handle(string $method): void
    {
        switch ($method) {
            case 'GET':
                $this->index();
                break;
            case 'POST':
                $this->store();
                break;
            case 'DELETE':
                $this->destroy();
                break;
            default:
                http_response_code(405);
                echo json_encode(["error" => "Method not allowed."]);
        }
    }

    // GET — Lista todas as categorias ativas
    private function index(): void
    {
        try {
            $categories = $this->service->listAll();
            echo json_encode($categories);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error searching for categories: " . $e->getMessage()]);
        }
    }

    // POST — Cria uma nova categoria
    private function store(): void
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            $code = $this->service->create($data ?? []);

            http_response_code(201);
            echo json_encode(["message" => "Category created successfully!", "code" => $code]);

        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(["error" => $e->getMessage()]);
        } catch (PDOException $e) {
            http_response_code(400);
            echo json_encode(["error" => "Error creating category: " . $e->getMessage()]);
        }
    }

    // DELETE — Exclui uma categoria
    private function destroy(): void
    {
        try {
            $code = isset($_GET['code']) ? (int) $_GET['code'] : 0;
            $this->service->delete($code);

            http_response_code(200);
            echo json_encode(["message" => "Category successfully deleted!"]);

        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(["error" => $e->getMessage()]);
        } catch (RuntimeException $e) {
            http_response_code(404);
            echo json_encode(["error" => $e->getMessage()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error deleting category: " . $e->getMessage()]);
        }
    }
}
