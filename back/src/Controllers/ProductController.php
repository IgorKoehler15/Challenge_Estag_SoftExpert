<?php

require_once __DIR__ . '/../Services/ProductService.php';

class ProductController
{
    private ProductService $service;

    public function __construct(PDO $pdo)
    {
        $this->service = new ProductService($pdo);
    }

    // Roteia a requisição para o método adequado com base no HTTP method
    public function handleRequest(string $httpMethod): void
    {
        switch ($httpMethod) {
            case 'GET':
                $this->listProducts();
                break;
            case 'POST':
                $this->createProduct();
                break;
            case 'DELETE':
                $this->deleteProduct();
                break;
            default:
                http_response_code(405);
                echo json_encode(["error" => "Method not allowed."]);
        }
    }

    // GET — Lista todos os produtos ativos
    private function listProducts(): void
    {
        try {
            $products = $this->service->listAll();
            echo json_encode($products);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error searching for products: " . $e->getMessage()]);
        }
    }

    // POST — Cria um novo produto
    private function createProduct(): void
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);

            if ($data === null) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid request body."]);
                return;
            }

            $this->service->create($data);

            http_response_code(201);
            echo json_encode(["message" => "Product successfully created!"]);

        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(["error" => $e->getMessage()]);
        } catch (PDOException $e) {
            http_response_code(400);
            echo json_encode(["error" => "Error creating product: " . $e->getMessage()]);
        }
    }

    // DELETE — Exclui um produto
    private function deleteProduct(): void
    {
        try {
            $code = isset($_GET['code']) ? (int) $_GET['code'] : 0;
            $this->service->delete($code);

            http_response_code(200);
            echo json_encode(["message" => "Product successfully deleted!"]);

        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(["error" => $e->getMessage()]);
        } catch (RuntimeException $e) {
            http_response_code(404);
            echo json_encode(["error" => $e->getMessage()]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Error deleting product: " . $e->getMessage()]);
        }
    }
}
